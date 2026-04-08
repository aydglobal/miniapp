import { prisma } from '../lib/prisma';
import { applyAndLogEconomyEvent } from './economyLedger.service';

type Bucket = 'coins' | 'adnBalance' | 'eligibleRewardBalance';

export async function adminAdjustBalance(params: {
  targetUserId: string;
  adminUserId: string;
  bucket: Bucket;
  amount: number;
  note: string;
}) {
  await applyAndLogEconomyEvent({
    userId: params.targetUserId,
    type: 'admin_adjustment',
    amount: params.amount,
    currency: params.bucket,
    reason: params.note,
    refType: 'admin_user',
    refId: params.adminUserId,
    meta: { adminUserId: params.adminUserId, note: params.note }
  });

  await prisma.adminAction.create({
    data: {
      adminId: params.adminUserId,
      targetUserId: params.targetUserId,
      action: 'balance_adjustment',
      reason: params.note,
      meta: { bucket: params.bucket, amount: params.amount }
    }
  });

  return prisma.user.findUnique({ where: { id: params.targetUserId } });
}
