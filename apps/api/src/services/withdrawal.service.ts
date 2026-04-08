import { MIN_WITHDRAWAL_COINS, SUPPORTED_PAYOUT_METHODS, WITHDRAWAL_COOLDOWN_HOURS } from '../config/payout';
import { evaluateWithdrawalRisk } from '../lib/fraud';
import { prisma } from '../lib/prisma';

export async function createWithdrawalRequest(params: {
  userId: string;
  method: (typeof SUPPORTED_PAYOUT_METHODS)[number];
  amountCoins: number;
  payoutAddress: string;
}) {
  if (!SUPPORTED_PAYOUT_METHODS.includes(params.method)) {
    throw new Error('Unsupported payout method');
  }

  if (params.amountCoins < MIN_WITHDRAWAL_COINS) {
    throw new Error(`Minimum withdrawal is ${MIN_WITHDRAWAL_COINS} coins`);
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: params.userId } });

    if (user.eligibleRewardBalance < params.amountCoins) {
      throw new Error('Not enough eligible reward balance');
    }

    const lastPending = await tx.withdrawalRequest.findFirst({
      where: { userId: params.userId },
      orderBy: { createdAt: 'desc' }
    });

    if (lastPending && Date.now() - lastPending.createdAt.getTime() < WITHDRAWAL_COOLDOWN_HOURS * 3600_000) {
      throw new Error('Withdrawal cooldown active');
    }

    const referralCount = await tx.referral.count({ where: { referrerUserId: params.userId } });
    const qualifiedReferralCount = await tx.referral.count({ where: { referrerUserId: params.userId, status: 'approved' } });
    const accountAgeDays = Math.floor((Date.now() - user.createdAt.getTime()) / 86400000);
    const risk = evaluateWithdrawalRisk({
      suspiciousScore: user.suspiciousScore,
      referralCount,
      qualifiedReferralCount,
      amountCoins: params.amountCoins,
      accountAgeDays
    });

    if (risk.action === 'reject') {
      throw new Error('Withdrawal rejected by fraud policy');
    }

    await tx.user.update({
      where: { id: params.userId },
      data: { eligibleRewardBalance: { decrement: params.amountCoins } }
    });

    const request = await tx.withdrawalRequest.create({
      data: {
        userId: params.userId,
        method: params.method,
        amountCoins: params.amountCoins,
        amountPayout: params.amountCoins / 1000,
        payoutAddress: params.payoutAddress,
        status: risk.action === 'approve_fast' ? 'approved' : 'pending',
        riskScore: risk.riskScore,
        reviewedAt: risk.action === 'approve_fast' ? new Date() : null
      }
    });

    return request;
  });
}

export async function listUserWithdrawals(userId: string) {
  return prisma.withdrawalRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}
