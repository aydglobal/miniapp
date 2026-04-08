import { prisma } from '../lib/prisma';

type Bucket = 'coins' | 'adnBalance' | 'eligibleRewardBalance';

const bucketMap = {
  coins: 'coins',
  adnBalance: 'adn',
  eligibleRewardBalance: 'eligible_reward'
} as const;

/**
 * Sadece ledger kaydı yazar — balance'ı DEĞİŞTİRMEZ.
 * Çağıran taraf zaten prisma.user.update ile balance'ı güncellemiş olmalı.
 */
export async function writeEconomyEvent(params: {
  userId: string;
  type: string;
  amount: number;
  currency?: Bucket;
  reason?: string;
  refType?: string;
  refId?: string;
  meta?: Record<string, unknown>;
}) {
  const currency = params.currency || 'coins';

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { coins: true, adnBalance: true, eligibleRewardBalance: true }
  });

  if (!user) return null;

  const before = Number(user[currency] || 0);
  // amount zaten uygulanmış, after = current balance
  const after = before;

  return prisma.walletLedgerEntry.create({
    data: {
      userId: params.userId,
      entryType: params.type,
      bucket: bucketMap[currency],
      amount: params.amount,
      balanceBefore: before - params.amount, // geriye hesapla
      balanceAfter: after,
      reason: params.reason || params.type,
      refType: params.refType,
      refId: params.refId,
      metadataJson: params.meta ? JSON.stringify(params.meta) : undefined
    }
  });
}

/**
 * Balance'ı günceller VE ledger kaydı yazar — atomik.
 * Sadece admin düzeltmeleri veya standalone işlemler için kullan.
 */
export async function applyAndLogEconomyEvent(params: {
  userId: string;
  type: string;
  amount: number;
  currency?: Bucket;
  reason?: string;
  refType?: string;
  refId?: string;
  meta?: Record<string, unknown>;
}) {
  const currency = params.currency || 'coins';

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: params.userId } });
    const before = Number(user[currency] || 0);
    const after = before + params.amount;

    await tx.user.update({
      where: { id: params.userId },
      data: { [currency]: { increment: params.amount } }
    });

    return tx.walletLedgerEntry.create({
      data: {
        userId: params.userId,
        entryType: params.type,
        bucket: bucketMap[currency],
        amount: params.amount,
        balanceBefore: before,
        balanceAfter: after,
        reason: params.reason || params.type,
        refType: params.refType,
        refId: params.refId,
        metadataJson: params.meta ? JSON.stringify(params.meta) : undefined
      }
    });
  });
}
