import { prisma } from "../lib/prisma";

type Bucket = "coins" | "adnBalance" | "eligibleRewardBalance" | "lockedRewardBalance";

export async function appendLedgerEntry(params: {
  userId: string;
  bucket: Bucket;
  amount: number;
  entryType:
    | "tap_reward"
    | "passive_income"
    | "mission_reward"
    | "referral_reward"
    | "daily_reward"
    | "purchase_spend"
    | "premium_purchase"
    | "admin_adjustment"
    | "reversal"
    | "payout_lock"
    | "payout_release";
  reason: string;
  refType?: string;
  refId?: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: params.userId } });
    if (!user) throw new Error("User not found");

    const before = user[params.bucket] as number;
    const after = before + params.amount;
    if (after < 0) throw new Error("Insufficient balance");

    await tx.user.update({
      where: { id: params.userId },
      data: {
        [params.bucket]: after,
      },
    });

    const bucketMap = {
      coins: "coins",
      adnBalance: "adn",
      eligibleRewardBalance: "eligible_reward",
      lockedRewardBalance: "locked_reward",
    } as const;

    return tx.walletLedgerEntry.create({
      data: {
        userId: params.userId,
        entryType: params.entryType,
        bucket: bucketMap[params.bucket],
        amount: params.amount,
        balanceBefore: before,
        balanceAfter: after,
        reason: params.reason,
        refType: params.refType,
        refId: params.refId,
        metadataJson: params.metadata ? JSON.stringify(params.metadata) : undefined,
      },
    });
  });
}
