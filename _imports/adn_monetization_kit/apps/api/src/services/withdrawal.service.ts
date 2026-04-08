import { prisma } from "../lib/prisma";
import { WITHDRAWAL_RULES } from "../lib/monetization.constants";

export async function createWithdrawalRequest(params: {
  userId: string;
  currency: "TON" | "USDT";
  amount: number;
  destinationAddress: string;
}) {
  const wallet = await prisma.userWallet.findUnique({ where: { userId: params.userId } });
  if (!wallet) throw new Error("Wallet not found");

  const rule = params.currency === "TON" ? WITHDRAWAL_RULES.ton : WITHDRAWAL_RULES.usdt;
  if (params.amount < rule.minAmount) throw new Error("Amount below minimum");

  const recent = await prisma.withdrawalRequest.findFirst({
    where: {
      userId: params.userId,
      createdAt: {
        gt: new Date(Date.now() - rule.cooldownHours * 3600 * 1000),
      },
      status: {
        in: ["pending", "under_review", "approved"],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recent) throw new Error("Withdrawal cooldown active");
  if (Number(wallet.eligibleRewardBalance) < params.amount) throw new Error("Insufficient eligible reward balance");

  const riskScore = await computeWithdrawalRisk(params.userId, params.amount);

  const status = riskScore >= 0.8 ? "under_review" : "pending";

  return prisma.$transaction(async (tx) => {
    await tx.userWallet.update({
      where: { userId: params.userId },
      data: {
        eligibleRewardBalance: { decrement: params.amount as any },
        lockedRewardBalance: { increment: params.amount as any },
      },
    });

    return tx.withdrawalRequest.create({
      data: {
        userId: params.userId,
        currency: params.currency,
        amount: params.amount as any,
        destinationAddress: params.destinationAddress,
        riskScore,
        status: status as any,
      },
    });
  });
}

export async function approveWithdrawal(withdrawalId: string) {
  const req = await prisma.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
  if (!req) throw new Error("Withdrawal not found");
  if (!["pending", "under_review"].includes(req.status)) throw new Error("Invalid status");

  return prisma.withdrawalRequest.update({
    where: { id: withdrawalId },
    data: {
      status: "approved",
      approvedAt: new Date(),
    },
  });
}

export async function markWithdrawalSent(withdrawalId: string, externalTxId?: string) {
  const req = await prisma.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
  if (!req) throw new Error("Withdrawal not found");
  if (req.status !== "approved") throw new Error("Only approved requests can be sent");

  return prisma.$transaction(async (tx) => {
    await tx.userWallet.update({
      where: { userId: req.userId },
      data: {
        lockedRewardBalance: { decrement: req.amount as any },
        withdrawnTotal: { increment: req.amount as any },
      },
    });

    return tx.withdrawalRequest.update({
      where: { id: req.id },
      data: {
        status: "sent",
        sentAt: new Date(),
        externalTxId,
      },
    });
  });
}

export async function rejectWithdrawal(withdrawalId: string, rejectionReason: string) {
  const req = await prisma.withdrawalRequest.findUnique({ where: { id: withdrawalId } });
  if (!req) throw new Error("Withdrawal not found");
  if (!["pending", "under_review", "approved"].includes(req.status)) throw new Error("Invalid status");

  return prisma.$transaction(async (tx) => {
    await tx.userWallet.update({
      where: { userId: req.userId },
      data: {
        lockedRewardBalance: { decrement: req.amount as any },
        eligibleRewardBalance: { increment: req.amount as any },
      },
    });

    return tx.withdrawalRequest.update({
      where: { id: req.id },
      data: {
        status: "rejected",
        rejectionReason,
      },
    });
  });
}

async function computeWithdrawalRisk(userId: string, amount: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return 1;
  let score = 0;
  if ((user as any).suspiciousScore && (user as any).suspiciousScore > 0) score += 0.4;
  if ((user as any).fraudLockedUntil && new Date((user as any).fraudLockedUntil) > new Date()) score += 0.6;
  if (amount > 50) score += 0.2;
  return Math.min(1, score);
}
