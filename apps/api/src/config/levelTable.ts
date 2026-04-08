/**
 * ADN Phase 2 — Level Table
 * Her level için XP eşiği, unlock'lar ve ödüller.
 */
export type LevelRow = {
  level: number;
  xpToNext: number;
  unlocks: string[];
  reward: { coins?: number; gems?: number; chest?: number };
};

export const levelTable: LevelRow[] = [
  { level: 1,  xpToNext: 80,    unlocks: ["daily_bonus"],                  reward: { coins: 100 } },
  { level: 2,  xpToNext: 120,   unlocks: ["mission_board"],                reward: { coins: 180 } },
  { level: 3,  xpToNext: 180,   unlocks: ["passive_income"],               reward: { coins: 280 } },
  { level: 4,  xpToNext: 260,   unlocks: ["combo_meter"],                  reward: { coins: 420 } },
  { level: 5,  xpToNext: 360,   unlocks: ["referral_hub"],                 reward: { chest: 1 } },
  { level: 6,  xpToNext: 500,   unlocks: ["boost_shop"],                   reward: { coins: 720 } },
  { level: 8,  xpToNext: 860,   unlocks: ["rare_chests"],                  reward: { chest: 1 } },
  { level: 10, xpToNext: 1380,  unlocks: ["event_access"],                 reward: { gems: 20 } },
  { level: 12, xpToNext: 2100,  unlocks: ["elite_upgrades"],               reward: { coins: 2400 } },
  { level: 15, xpToNext: 3400,  unlocks: ["clan_center"],                  reward: { chest: 2 } },
  { level: 18, xpToNext: 5200,  unlocks: ["prestige"],                     reward: { gems: 50 } },
  { level: 22, xpToNext: 7800,  unlocks: ["automation"],                   reward: { coins: 9000 } },
  { level: 28, xpToNext: 12800, unlocks: ["smart_missions"],               reward: { chest: 2 } },
  { level: 35, xpToNext: 20500, unlocks: ["airdrop_claim_eligibility"],    reward: { gems: 120 } },
];

/** Level için unlock listesini döner */
export function getUnlocksForLevel(level: number): string[] {
  return levelTable.find((row) => row.level === level)?.unlocks ?? [];
}

/** Level için ödülü döner */
export function getRewardForLevel(level: number) {
  return levelTable.find((row) => row.level === level)?.reward ?? {};
}

/** Bir feature'ın hangi level'da açıldığını döner */
export function getUnlockLevel(feature: string): number {
  return levelTable.find((row) => row.unlocks.includes(feature))?.level ?? 1;
}
