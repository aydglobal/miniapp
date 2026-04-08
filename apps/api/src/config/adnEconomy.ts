import economyConfig from './design/adn_economy_config.json';
import featureUnlocksData from './design/feature_unlocks.json';
import levelUnlockMapData from './design/level_unlock_map.json';
import levelsData from './design/levels.json';
import missionEngineData from './design/mission_engine.json';
import referralQuestData from './design/referral_quests.json';
import shopCardsData from './design/shop_cards.json';
import upgradesData from './design/upgrades.json';
import upgradeTiersData from './design/upgrade_tiers.json';

export type EconomyLevelConfig = (typeof levelsData)[number];
export type FeatureUnlock = (typeof featureUnlocksData)[number];
export type MissionTemplate = (typeof missionEngineData)[number];
export type ReferralQuestStage = (typeof referralQuestData)[number];
export type ShopCardTier = (typeof shopCardsData)[number]['tiers'][number];
export type ShopCard = (typeof shopCardsData)[number];
export type UpgradeDefinition = (typeof upgradesData)[number];
export type LevelUnlockMapEntry = (typeof levelUnlockMapData)[number];
export type UpgradeTierDefinition = (typeof upgradeTiersData)[number];

export const ADN_ECONOMY = economyConfig;
export const ADN_LEVELS: EconomyLevelConfig[] = levelsData;
export const ADN_FEATURE_UNLOCKS: FeatureUnlock[] = featureUnlocksData;
export const ADN_LEVEL_UNLOCK_MAP: LevelUnlockMapEntry[] = levelUnlockMapData;
export const ADN_MISSION_ENGINE: MissionTemplate[] = missionEngineData;
export const ADN_REFERRAL_QUESTS: ReferralQuestStage[] = referralQuestData;
export const ADN_SHOP_CARDS: ShopCard[] = shopCardsData;
export const ADN_UPGRADES: UpgradeDefinition[] = upgradesData;
export const ADN_UPGRADE_TIERS: UpgradeTierDefinition[] = upgradeTiersData;

export function getLevelConfigForCoins(coins: number) {
  const total = Math.max(0, Math.floor(coins));
  let current = ADN_LEVELS[0];

  for (const level of ADN_LEVELS) {
    if (total >= level.cumulative_xp) {
      current = level;
      continue;
    }

    break;
  }

  return current;
}

export function getLevelConfig(level: number) {
  return ADN_LEVELS.find((entry) => entry.level === level) ?? ADN_LEVELS[ADN_LEVELS.length - 1];
}

export function getNextLevelConfig(level: number) {
  return ADN_LEVELS.find((entry) => entry.level === level + 1) ?? null;
}

export function getLevelUnlockMapEntry(level: number) {
  return ADN_LEVEL_UNLOCK_MAP.find((entry) => entry.level === level) ?? ADN_LEVEL_UNLOCK_MAP[ADN_LEVEL_UNLOCK_MAP.length - 1];
}

export function getFeatureUnlocksAtLevel(level: number) {
  return ADN_FEATURE_UNLOCKS.filter((entry) => entry.player_level === level);
}

export function getNextFeatureUnlock(level: number) {
  return ADN_FEATURE_UNLOCKS.find((entry) => entry.player_level > level) ?? null;
}

export function getUnlockedShopCards(level: number) {
  return ADN_SHOP_CARDS.filter((card) => card.unlockLevel <= level);
}

export function getUpcomingShopCards(level: number, limit = 4) {
  return ADN_SHOP_CARDS.filter((card) => card.unlockLevel > level)
    .sort((left, right) => left.unlockLevel - right.unlockLevel)
    .slice(0, limit);
}

export function getFeaturedShopCards(level: number, limit = 6) {
  return getUnlockedShopCards(level)
    .sort((left, right) => {
      if (left.unlockLevel !== right.unlockLevel) {
        return right.unlockLevel - left.unlockLevel;
      }

      return right.tiers[0].addedHourlyADN - left.tiers[0].addedHourlyADN;
    })
    .slice(0, limit);
}

export function getShopCard(cardId: string) {
  return ADN_SHOP_CARDS.find((entry) => entry.id === cardId) ?? null;
}

export function getTierPreview(cardId: string, tier = 1): ShopCardTier | null {
  const card = ADN_SHOP_CARDS.find((entry) => entry.id === cardId);
  if (!card) return null;
  return card.tiers.find((entry) => entry.tier === tier) ?? null;
}

export function getReferralQuestTemplatesForLevel(level: number) {
  return ADN_REFERRAL_QUESTS.filter((entry) => entry.unlock_level <= level);
}

export function getMissionTemplate(segment: string) {
  const normalized = segment.trim().toLowerCase();
  return ADN_MISSION_ENGINE.find((entry) => entry.player_segment.toLowerCase() === normalized) ?? ADN_MISSION_ENGINE[0];
}
