import { prisma } from '../lib/prisma';
import { getActiveBoostMap, getEffectiveEnergyMax } from '../lib/boosts';
import { restoreEnergy } from '../lib/energy';
import { env } from '../lib/env';
import { resolveGameplayState } from './economyRuntime.service';
import {
  calculateChestChance,
  calculateComboMultiplier,
  calculateCritChance,
  calculatePrestigeBonus,
  onUserChurn,
  smartNotify
} from './engagement.service';
import { syncPassiveIncome } from './income.service';

export async function getProfile(userId: string) {
  // syncPassiveIncome sadece explicit claim'de çağrılır, her profile fetch'te değil
  // await syncPassiveIncome(userId).catch(() => null);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      boosts: true,
      ownedUpgrades: true,
      referralsSent: true,
      clanMembership: {
        include: {
          clan: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const boostState = getActiveBoostMap(
    user.boosts.map((boost) => ({
      type: boost.type,
      level: boost.level,
      expiresAt: boost.expiresAt
    }))
  );
  const gameplay = resolveGameplayState(user, user.ownedUpgrades);
  const effectiveEnergyMax = getEffectiveEnergyMax(gameplay.maxEnergy, boostState.energyMaxBonus);
  const effectiveRegenPerMinute = gameplay.regenPerMinute * boostState.regenMultiplier;
  const restored = restoreEnergy({
    currentEnergy: user.energy,
    lastEnergyAt: user.lastEnergyAt,
    energyMax: effectiveEnergyMax,
    regenPerMinute: effectiveRegenPerMinute
  });

  const needsUpdate =
    restored.energy !== user.energy ||
    effectiveEnergyMax !== user.maxEnergy ||
    user.level !== gameplay.level ||
    user.passiveIncomePerHour !== gameplay.passiveIncomePerHour;

  const updatedUser = needsUpdate
    ? await prisma.user.update({
        where: { id: user.id },
        data: {
          energy: restored.energy,
          maxEnergy: gameplay.maxEnergy,
          level: gameplay.level,
          passiveIncomePerHour: gameplay.passiveIncomePerHour,
          offlineCapHours: gameplay.offlineCapHours,
          lastEnergyAt: restored.lastEnergyAt
        },
        include: {
          boosts: true,
          ownedUpgrades: true,
          referralsSent: true,
          clanMembership: { include: { clan: true } }
        }
      })
    : await prisma.user.findUniqueOrThrow({
        where: { id: user.id },
        include: {
          boosts: true,
          ownedUpgrades: true,
          referralsSent: true,
          clanMembership: { include: { clan: true } }
        }
      });

  const prestigeBonus = calculatePrestigeBonus(gameplay.level);
  const critChance = calculateCritChance(gameplay.level);
  const chestChance = calculateChestChance(gameplay.level);
  const comboMultiplier = calculateComboMultiplier(updatedUser.tapsInWindow || 1);
  const hoursAway = updatedUser.lastSeenAt ? (Date.now() - updatedUser.lastSeenAt.getTime()) / 3600_000 : 0;

  return {
    id: updatedUser.id,
    telegramId: updatedUser.telegramId,
    displayName: updatedUser.displayName,
    username: updatedUser.username,
    coins: updatedUser.coins,
    xp: updatedUser.xp,
    energy: restored.energy,
    maxEnergy: effectiveEnergyMax,
    level: gameplay.level,
    tapPower: Math.max(1, Math.floor(gameplay.tapReward)),
    passiveIncomePerHour: gameplay.passiveIncomePerHour,
    pendingMiningCoins: updatedUser.pendingPassiveIncome,
    pendingPassiveIncome: updatedUser.pendingPassiveIncome,
    maxOfflineHours: gameplay.offlineCapHours,
    referralCode: updatedUser.referralCode,
    isAdmin: Boolean(updatedUser.isAdmin || normalizeUsername(updatedUser.username) === normalizeUsername(env.ADMIN_TELEGRAM_USERNAME)),
    status: updatedUser.status,
    trustScore: updatedUser.trustScore,
    suspiciousScore: updatedUser.suspiciousScore,
    totalTaps: updatedUser.totalTaps,
    dailyStreak: updatedUser.dailyStreak,
    tapNonce: updatedUser.tapNonce,
    tapMultiplier: boostState.tapMultiplier,
    regenMultiplier: boostState.regenMultiplier,
    prestigeBonus,
    critChance,
    chestChance,
    comboMultiplier,
    unlocks: gameplay.levelUnlock?.unlocks || [],
    nextFeatureUnlock: gameplay.nextFeatureUnlock,
    ownedUpgradeCount: updatedUser.ownedUpgrades.length,
    smartNotification: smartNotify({
      dailyStreak: updatedUser.dailyStreak,
      pendingPassiveIncome: updatedUser.pendingPassiveIncome,
      canClaimDaily: !updatedUser.lastDailyClaimAt,
      referralCount: updatedUser.referralsSent.length
    }),
    activeOffer: onUserChurn({
      hoursAway,
      pendingPassiveIncome: updatedUser.pendingPassiveIncome
    }),
    clan: updatedUser.clanMembership?.clan
      ? {
          id: updatedUser.clanMembership.clan.id,
          name: updatedUser.clanMembership.clan.name,
          slug: updatedUser.clanMembership.clan.slug,
          role: updatedUser.clanMembership.role,
          totalScore: updatedUser.clanMembership.clan.totalScore,
          memberCount: 0
        }
      : null,
    dailyFreeBoostClaimAt: updatedUser.dailyFreeBoostClaimAt?.toISOString() || null,
    boosts: boostState.active.map((boost) => ({
      type: boost.type,
      level: boost.level,
      expiresAt: boost.expiresAt.toISOString()
    }))
  };
}

function normalizeUsername(value?: string | null) {
  return String(value || '').replace(/^@/, '').toLowerCase();
}
