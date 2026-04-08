import { prisma } from '../lib/prisma';
import { resolveGameplayState } from './economyRuntime.service';
import { writeEconomyEvent } from './economyLedger.service';

const MS_IN_HOUR = 60 * 60 * 1000;

export async function syncPassiveIncome(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { ownedUpgrades: true }
  });

  if (!user) throw new Error('User not found');

  const gameplay = resolveGameplayState(user, user.ownedUpgrades);
  const now = new Date();
  const lastAt = user.lastPassiveIncomeAt ?? user.lastTapAt ?? user.updatedAt;
  const elapsedMs = Math.max(0, now.getTime() - new Date(lastAt).getTime());
  const cappedMs = Math.min(elapsedMs, gameplay.offlineCapHours * MS_IN_HOUR);
  const generated = Math.floor((cappedMs / MS_IN_HOUR) * gameplay.passiveIncomePerHour);

  if (generated <= 0) {
    return {
      generated: 0,
      pendingPassiveIncome: user.pendingPassiveIncome,
      passiveIncomePerHour: gameplay.passiveIncomePerHour,
      offlineCapHours: gameplay.offlineCapHours
    };
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      pendingPassiveIncome: { increment: generated },
      lastPassiveIncomeAt: now,
      lastSeenAt: now,
      level: gameplay.level,
      maxEnergy: gameplay.maxEnergy,
      offlineCapHours: gameplay.offlineCapHours
    }
  });

  return {
    generated,
    pendingPassiveIncome: updated.pendingPassiveIncome,
    passiveIncomePerHour: gameplay.passiveIncomePerHour,
    offlineCapHours: gameplay.offlineCapHours
  };
}

export async function claimPassiveIncome(userId: string) {
  await syncPassiveIncome(userId);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const amount = user.pendingPassiveIncome;
  if (amount <= 0) return { claimed: 0, coins: user.coins, xp: user.xp };

  // Balance güncelle
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      coins: { increment: amount },
      xp: { increment: amount },
      totalLifetimeCoins: { increment: amount },
      pendingPassiveIncome: 0,
      totalPassiveClaimed: { increment: amount }
    }
  });

  // Sadece log yaz (balance zaten güncellendi)
  await writeEconomyEvent({
    userId,
    type: 'passive_income',
    amount,
    reason: 'offline_claim',
    meta: { source: 'income_claim' }
  });

  return { claimed: amount, coins: updated.coins, xp: updated.xp };
}
