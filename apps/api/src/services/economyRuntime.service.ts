import { getLevelConfigForCoins, getLevelUnlockMapEntry, getNextFeatureUnlock, type ShopCard } from '../config/adnEconomy';
import { getLiveTuningConfig } from './adminConfig.service';
import { calculatePermanentMetaBonus } from './engagement.service';

type UpgradeLike = {
  cardKey: string;
  level: number;
};

type UserEconomyLike = {
  coins: number;
  xp?: number | null;
  passiveIncomePerHour?: number | null;
  offlineCapHours?: number | null;
  prestigePower?: number | null;
  metaTapMastery?: number | null;
  metaCritLab?: number | null;
  metaEnergyReactor?: number | null;
  metaOfflineVault?: number | null;
  metaClanHonor?: number | null;
};

const MIN_PASSIVE_INCOME_PER_HOUR = 120;

function getUpgradeLevel(upgrades: UpgradeLike[], cardKey: string) {
  return upgrades.find((item) => item.cardKey === cardKey)?.level ?? 0;
}

export function resolveGameplayState(user: UserEconomyLike, upgrades: UpgradeLike[] = []) {
  const liveTuning = getLiveTuningConfig();
  const progressionXp = Math.max(0, Math.floor(Math.max(user.xp || 0, user.coins || 0)));
  const levelConfig = getLevelConfigForCoins(progressionXp);
  const levelUnlock = getLevelUnlockMapEntry(levelConfig.level);

  const tapEngineLevel = getUpgradeLevel(upgrades, 'tap_engine');
  const gpuClusterLevel = getUpgradeLevel(upgrades, 'gpu_cluster');
  const liquidityPoolLevel = getUpgradeLevel(upgrades, 'liquidity_pool');
  const streakVaultLevel = getUpgradeLevel(upgrades, 'streak_vault');
  const quantumCoolerLevel = getUpgradeLevel(upgrades, 'quantum_cooler');
  const aiOptimizerLevel = getUpgradeLevel(upgrades, 'ai_optimizer');
  const feeEngineLevel = getUpgradeLevel(upgrades, 'fee_engine');
  const creatorBountiesLevel = getUpgradeLevel(upgrades, 'creator_bounties');
  const referralHubLevel = getUpgradeLevel(upgrades, 'referral_hub');
  const autoTapDronesLevel = getUpgradeLevel(upgrades, 'auto_tap_drones');
  const walletVaultLevel = getUpgradeLevel(upgrades, 'wallet_vault');

  const tapBonus = Math.floor(tapEngineLevel / 5) * 0.01;
  const allHourlyBonus = aiOptimizerLevel * 0.004;
  const idleHourlyBonus = liquidityPoolLevel * 0.005 + autoTapDronesLevel * 0.005;
  const passiveCapBonus = feeEngineLevel * 0.005;

  const tapReward = Number((levelConfig.tap_reward * (1 + tapBonus) * liveTuning.tap.baseReward).toFixed(2));
  const maxEnergy = levelConfig.max_energy + quantumCoolerLevel * 15;
  const regenPerMinute = levelConfig.regen_per_min + Math.floor(gpuClusterLevel / 5) * 5;
  const offlineCapHours = Number(
    Math.min(12, Math.max(user.offlineCapHours || levelConfig.offline_cap_hours, levelConfig.offline_cap_hours + liquidityPoolLevel * 0.03)).toFixed(2)
  );
  const passiveCapPerHour = Math.floor(levelConfig.passive_cap_per_hour * (1 + passiveCapBonus));
  const rawPassiveIncome = Math.floor(Math.max(MIN_PASSIVE_INCOME_PER_HOUR, user.passiveIncomePerHour || 0));
  const passiveIncomePerHour = Math.floor(
    Math.min(passiveCapPerHour, rawPassiveIncome * (1 + allHourlyBonus + idleHourlyBonus) * liveTuning.economy.passiveIncomeMultiplier)
  );
  const permanentMetaBonus = calculatePermanentMetaBonus({
    prestigePower: user.prestigePower || 0,
    tapMastery: user.metaTapMastery || 0,
    critLab: user.metaCritLab || 0,
    energyReactor: user.metaEnergyReactor || 0,
    offlineVault: user.metaOfflineVault || 0,
    clanHonor: user.metaClanHonor || 0
  });
  const dailyRewardMultiplier = (1 + Math.floor(streakVaultLevel / 3) * 0.02) * liveTuning.economy.dailyRewardMultiplier;
  const missionRewardMultiplier = (1 + creatorBountiesLevel * 0.015) * liveTuning.economy.missionRewardMultiplier;
  const referralRewardMultiplier = 1 + referralHubLevel * 0.01;
  const trustBonus = walletVaultLevel * 0.5;
  const nextFeatureUnlock = getNextFeatureUnlock(levelConfig.level);

  return {
    progressionXp,
    level: levelConfig.level,
    tapReward: Number((tapReward * permanentMetaBonus.tapMultiplier).toFixed(2)),
    maxEnergy: Math.floor(maxEnergy * (1 + permanentMetaBonus.energyBonus)),
    regenPerMinute,
    offlineCapHours: Number((offlineCapHours * (1 + permanentMetaBonus.offlineCapBonus)).toFixed(2)),
    passiveCapPerHour,
    passiveIncomePerHour,
    dailyRewardMultiplier,
    missionRewardMultiplier,
    referralRewardMultiplier,
    trustBonus,
    permanentMetaBonus,
    levelConfig,
    levelUnlock,
    nextFeatureUnlock
  };
}

export function getPassiveIncomeDelta(currentHourly: number, nextTierHourly: number) {
  return Math.max(0, nextTierHourly - currentHourly);
}

export function getCardCurrentHourly(card: ShopCard, currentLevel: number) {
  return card.tiers.find((tier) => tier.tier === currentLevel)?.addedHourlyADN ?? 0;
}

export function resolvePlayerSegment(input: {
  level: number;
  suspiciousScore?: number;
  paymentsCount?: number;
  referralCount?: number;
  totalTaps?: number;
  lastSeenAt?: Date | null;
  pendingPassiveIncome?: number;
}) {
  if ((input.suspiciousScore || 0) >= 12) return 'Suspicious';
  if ((input.paymentsCount || 0) >= 2) return 'Whale';
  if ((input.paymentsCount || 0) === 1) return 'Mid spender';
  if ((input.referralCount || 0) >= 2 || input.level >= 8) return 'Referral-focused';
  if (input.lastSeenAt && Date.now() - input.lastSeenAt.getTime() > 36 * 3600_000) return 'Cooling';
  if ((input.pendingPassiveIncome || 0) > Math.max(600, input.level * 50)) return 'Idle lover';
  if ((input.totalTaps || 0) > 300 || input.level >= 12) return 'Active grinder';
  if (input.level <= 3) return 'New user';
  return 'Daily user';
}
