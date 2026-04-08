import { ADN_LEVELS, ADN_UPGRADES, ADN_REFERRAL_QUESTS, ADN_MISSION_ENGINE } from "./adnEconomy.constants";

export function getLevelConfig(level: number) {
  return ADN_LEVELS.find((x) => x.level === level) ?? ADN_LEVELS[ADN_LEVELS.length - 1];
}

export function getUpgradeCard(id: string) {
  return ADN_UPGRADES.find((x) => x.id === id);
}

export function getUpgradeTier(id: string, tier: number) {
  const card = getUpgradeCard(id);
  if (!card) return null;

  return {
    upgradeId: id,
    tier,
    costADN: Math.round(card.base_cost * Math.pow(card.cost_growth, tier - 1)),
    addedHourlyADN: Math.round(card.base_hourly_gain * Math.pow(card.gain_growth, tier - 1)),
    unlockLevel: card.unlock_level,
    secondaryEffect: card.secondary_effect,
    effectPerTier: card.effect_per_tier,
  };
}

export function pickNextMission(segment: string) {
  return ADN_MISSION_ENGINE.find((x) => x.player_segment.toLowerCase() === segment.toLowerCase()) ?? ADN_MISSION_ENGINE[0];
}

export function nextReferralStage(chainName: string, completedStage: number) {
  return ADN_REFERRAL_QUESTS.find((q) => q.chain === chainName && q.stage === completedStage + 1) ?? null;
}