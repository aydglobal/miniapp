import { prisma } from "../lib/prisma";

type LedgerInput = {
  userId: string;
  type: string;
  amount: number;
  currency: string;
  meta: Record<string, unknown>;
};

export async function writeEconomyEvent(input: LedgerInput) {
  return prisma.economyEventLog.create({
    data: {
      userId: input.userId,
      type: input.type,
      amount: input.amount,
      currency: input.currency,
      metaJson: JSON.stringify(input.meta),
    },
  });
}
