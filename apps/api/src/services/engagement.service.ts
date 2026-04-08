import { getLiveTuningConfig } from './adminConfig.service';
import { comboMultiplierFor } from '../engines/comboEngine';
import { prestigeBuff } from '../engines/prestigeEngine';
import { economyConfig } from '../config/economyConfig';

type ChestTier = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

const CHEST_DROP_CHANCE = 0.1;
const BASE_CRIT_CHANCE = 0.05;
const BASE_CRIT_MULTIPLIER = 5;

const CHEST_REWARDS: Record<ChestTier, number> = {
  common: 60,
  rare: 180,
  epic: 520,
  legendary: 1400,
  mythic: 3200
};

export function calculatePrestigeBonus(level: number) {
  // Phase 2: prestige buff'ı engine'den al
  const buff = prestigeBuff(Math.max(0, level - 15));
  return Number(Math.max(1, buff.globalEarnMultiplier).toFixed(2));
}

export function calculatePermanentMetaBonus(meta: {
  prestigePower?: number;
  tapMastery?: number;
  critLab?: number;
  energyReactor?: number;
  offlineVault?: number;
  clanHonor?: number;
}) {
  return {
    tapMultiplier: 1 + (meta.tapMastery || 0) * 0.02 + (meta.prestigePower || 0) * 0.03,
    critChanceBonus: (meta.critLab || 0) * 0.004,
    energyBonus: (meta.energyReactor || 0) * 0.03,
    offlineCapBonus: (meta.offlineVault || 0) * 0.05,
    clanContributionBonus: (meta.clanHonor || 0) * 0.04
  };
}

export function calculateComboMultiplier(totalWindowTaps: number) {
  // Phase 2: comboEngine'den al
  return Number(comboMultiplierFor(totalWindowTaps).toFixed(2));
}

export function calculateCritChance(level: number) {
  const tuning = getLiveTuningConfig();
  // Phase 2: base crit chance economyConfig'den
  const base = tuning.tap.critChance ?? economyConfig.critChance;
  return Number(Math.min(0.24, base + Math.max(0, level - 1) * 0.0025).toFixed(4));
}

export function calculateChestChance(level: number) {
  return Number(Math.min(0.18, CHEST_DROP_CHANCE + Math.max(0, level - 1) * 0.0015).toFixed(4));
}

export function calculateTapReward(
  base: number,
  options?: {
    prestigeBonus?: number;
    critChance?: number;
    critMultiplier?: number;
    comboMultiplier?: number;
  }
) {
  const tuning = getLiveTuningConfig();
  const prestigeBonus = options?.prestigeBonus ?? 1;
  // Phase 2: crit değerleri economyConfig'den
  const critChance = options?.critChance ?? tuning.tap.critChance ?? economyConfig.critChance;
  const critMultiplier = options?.critMultiplier ?? tuning.tap.critMultiplier ?? economyConfig.critMultiplier;
  const comboMultiplier = options?.comboMultiplier ?? 1;
  const criticalHit = Math.random() < critChance;
  const appliedCritMultiplier = criticalHit ? critMultiplier : 1;
  const reward = Math.max(
    1,
    Math.floor(base * prestigeBonus * comboMultiplier * appliedCritMultiplier)
  );

  return {
    reward,
    criticalHit,
    critMultiplier: appliedCritMultiplier,
    prestigeBonus,
    comboMultiplier
  };
}

export function rollChest(): ChestTier {
  const tuning = getLiveTuningConfig();
  const weights = {
    common: 55,
    rare: 25,
    epic: 12,
    legendary: Math.max(1, tuning.loot.legendaryWeight),
    mythic: Math.max(1, tuning.loot.mythicWeight)
  };
  const total = weights.common + weights.rare + weights.epic + weights.legendary + weights.mythic;
  const rand = Math.random() * total;

  if (rand < weights.common) return 'common';
  if (rand < weights.common + weights.rare) return 'rare';
  if (rand < weights.common + weights.rare + weights.epic) return 'epic';
  if (rand < weights.common + weights.rare + weights.epic + weights.legendary) return 'legendary';
  return 'mythic';
}

export function buildChestRewards(rarity: ChestTier) {
  if (rarity === 'mythic') return { adn: 5000, shards: 25, boostMinutes: 120 };
  if (rarity === 'legendary') return { adn: 2200, shards: 10, boostMinutes: 60 };
  if (rarity === 'epic') return { adn: 900, shards: 4, boostMinutes: 30 };
  if (rarity === 'rare') return { adn: 350, shards: 1, boostMinutes: 15 };
  return { adn: 120, shards: 0, boostMinutes: 0 };
}

export function rollJackpot() {
  return Math.random() < getLiveTuningConfig().loot.jackpotChance;
}

export function maybeDropChest(level: number, baseReward: number) {
  if (Math.random() >= calculateChestChance(level)) {
    return null;
  }

  const tier = rollChest();
  const built = buildChestRewards(tier);
  const jackpot = rollJackpot();
  const rewardCoins = Math.max(
    CHEST_REWARDS[tier],
    built.adn + (jackpot ? Math.max(500, built.adn) : 0),
    Math.floor(baseReward * (tier === 'mythic' ? 6 : tier === 'legendary' ? 4.5 : tier === 'epic' ? 2.8 : tier === 'rare' ? 1.8 : 1.2))
  );

  return {
    dropped: true as const,
    tier,
    rewardCoins,
    shards: built.shards,
    boostMinutes: built.boostMinutes,
    jackpot
  };
}

export function rewardUser(input: { level: number; isReturning?: boolean }) {
  const base = input.isReturning ? 120 : 50;
  return {
    coins: base + Math.max(0, input.level) * 12
  };
}

export function generateInviteReward(level = 1) {
  return {
    reward: 100 + Math.max(0, level) * 20
  };
}

export function onUserChurn(input: { hoursAway?: number; pendingPassiveIncome?: number }) {
  if ((input.hoursAway || 0) >= 36) return 'Comeback boost ready';
  if ((input.pendingPassiveIncome || 0) >= 400) return 'Offline bag is full';
  return null;
}

export function smartNotify(input: {
  dailyStreak?: number;
  pendingPassiveIncome?: number;
  canClaimDaily?: boolean;
  referralCount?: number;
}) {
  if (input.canClaimDaily) return 'Gunluk ADN odulu seni bekliyor.';
  if ((input.pendingPassiveIncome || 0) >= 300) return 'Pasif kazancin birikti, claim yap.';
  if ((input.referralCount || 0) === 0) return 'Bir davet daha gonder, sosyal zinciri ac.';
  if ((input.dailyStreak || 0) >= 3) return 'Serin iyi gidiyor, bugun de ritmi bozma.';
  return 'Bir kac tap daha ile yeni odulleri acabilirsin.';
}

export function detectBotV2(input: {
  suspiciousScore?: number;
  tapsInWindow?: number;
  trustScore?: number;
}) {
  return Boolean(
    (input.suspiciousScore || 0) >= 12 ||
    (input.tapsInWindow || 0) >= 80 ||
    (input.trustScore || 1) < 0.4
  );
}

export function getSkills() {
  return [
    { id: 'tap_boost', name: 'Tap Boost' },
    { id: 'crit_hunter', name: 'Crit Hunter' },
    { id: 'chest_luck', name: 'Chest Luck' }
  ];
}
