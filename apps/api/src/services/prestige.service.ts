import { prisma } from '../lib/prisma';
import { calculatePermanentMetaBonus } from './engagement.service';
import { prestigePointsFor, prestigeBuff, canPrestige as engineCanPrestige } from '../engines/prestigeEngine';
import { economyConfig } from '../config/economyConfig';

function canPrestige(params: {
  level: number;
  passiveIncomePerHour: number;
  totalLifetimeEarned: number;
}) {
  // Phase 2: engine'den kontrol et
  return engineCanPrestige({
    level: params.level,
    totalLifetimeEarned: params.totalLifetimeEarned,
    prestigeUnlockLevel: economyConfig.prestigeUnlockLevel
  });
}

function computePrestigeRewards(totalLifetimeEarned: number, highestLevel: number) {
  const prestigePower = prestigePointsFor(totalLifetimeEarned, highestLevel);
  const buff = prestigeBuff(prestigePower);
  return {
    prestigePower: Math.max(1, prestigePower),
    nebulaCoreGranted: 3 + prestigePower,
    buff
  };
}

export async function getPrestigeStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) throw new Error('User not found');

  const totalLifetimeEarned = user.totalLifetimeCoins + user.totalPassiveClaimed + user.referralRewardsGiven;
  const rewards = computePrestigeRewards(totalLifetimeEarned, user.level);
  const metaBonus = calculatePermanentMetaBonus({
    prestigePower: user.prestigePower,
    tapMastery: user.metaTapMastery,
    critLab: user.metaCritLab,
    energyReactor: user.metaEnergyReactor,
    offlineVault: user.metaOfflineVault,
    clanHonor: user.metaClanHonor
  });

  return {
    canPrestige: canPrestige({
      level: user.level,
      passiveIncomePerHour: user.passiveIncomePerHour,
      totalLifetimeEarned
    }),
    totalLifetimeEarned,
    estimatedPower: rewards.prestigePower,
    estimatedCore: rewards.nebulaCoreGranted,
    prestigePower: user.prestigePower,
    nebulaCore: user.nebulaCore,
    metaSkills: [
      { key: 'tap_mastery', name: 'Tap Mastery', level: user.metaTapMastery },
      { key: 'crit_lab', name: 'Crit Lab', level: user.metaCritLab },
      { key: 'energy_reactor', name: 'Energy Reactor', level: user.metaEnergyReactor },
      { key: 'offline_vault', name: 'Offline Vault', level: user.metaOfflineVault },
      { key: 'clan_honor', name: 'Clan Honor', level: user.metaClanHonor }
    ],
    permanentBonus: metaBonus
  };
}

export async function activatePrestige(userId: string) {
  const status = await getPrestigeStatus(userId);
  if (!status.canPrestige) throw new Error('Prestige kosullari henuz tamamlanmadi');

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId }
  });

  const rewards = computePrestigeRewards(status.totalLifetimeEarned, user.level);

  await prisma.$transaction(async (tx) => {
    await tx.userUpgrade.deleteMany({ where: { userId } });
    await tx.user.update({
      where: { id: userId },
      data: {
        passiveIncomePerHour: 120,
        pendingPassiveIncome: 0,
        level: 1,
        energy: 500,
        maxEnergy: 500,
        prestigePower: { increment: rewards.prestigePower },
        nebulaCore: { increment: rewards.nebulaCoreGranted },
        metaTapMastery: { increment: 1 },
        metaCritLab: user.level >= 25 ? { increment: 1 } : undefined,
        metaEnergyReactor: user.passiveIncomePerHour >= 8000 ? { increment: 1 } : undefined
      }
    });
  });

  return getPrestigeStatus(userId);
}
