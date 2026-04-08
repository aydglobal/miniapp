import { prisma } from "../lib/prisma";
import { writeEconomyEvent } from "./economyLedger.service";

const MS_IN_HOUR = 60 * 60 * 1000;

export async function syncPassiveIncome(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const now = new Date();
  const lastAt = user.lastPassiveIncomeAt ?? user.updatedAt;
  const elapsedMs = Math.max(0, now.getTime() - lastAt.getTime());
  const cappedMs = Math.min(elapsedMs, user.offlineCapHours * MS_IN_HOUR);

  const generated = Math.floor((cappedMs / MS_IN_HOUR) * user.passiveIncomePerHour);
  if (generated <= 0) {
    return { generated: 0, pendingPassiveIncome: user.pendingPassiveIncome };
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      pendingPassiveIncome: { increment: generated },
      lastPassiveIncomeAt: now,
      lastSeenAt: now,
    },
  });

  return {
    generated,
    pendingPassiveIncome: updated.pendingPassiveIncome,
  };
}

export async function claimPassiveIncome(userId: string) {
  await syncPassiveIncome(userId);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const amount = user.pendingPassiveIncome;
  if (amount <= 0) return { claimed: 0, coins: user.coins };

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      coins: { increment: amount },
      pendingPassiveIncome: 0,
      totalPassiveClaimed: { increment: amount },
    },
  });

  await writeEconomyEvent({
    userId,
    type: "passive_income_claim",
    amount,
    currency: "COIN",
    meta: {},
  });

  return {
    claimed: amount,
    coins: updated.coins,
  };
}
