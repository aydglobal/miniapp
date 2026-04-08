import { prisma } from "../lib/prisma";
import { appendLedgerEntry } from "./economyLedger.service";

export async function adminAdjustBalance(params: {
  targetUserId: string;
  adminUserId: string;
  bucket: "coins" | "adnBalance" | "eligibleRewardBalance" | "lockedRewardBalance";
  amount: number;
  note: string;
}) {
  const ledger = await appendLedgerEntry({
    userId: params.targetUserId,
    bucket: params.bucket,
    amount: params.amount,
    entryType: "admin_adjustment",
    reason: params.note,
    refType: "admin_user",
    refId: params.adminUserId,
    metadata: { adminUserId: params.adminUserId, note: params.note },
  });

  return ledger;
}

export async function resolveFraudCase(params: {
  caseId: string;
  adminUserId: string;
  resolutionNote: string;
  status: "resolved" | "dismissed";
}) {
  return prisma.fraudReviewCase.update({
    where: { id: params.caseId },
    data: {
      status: params.status,
      resolvedBy: params.adminUserId,
      resolutionNote: params.resolutionNote,
    },
  });
}
