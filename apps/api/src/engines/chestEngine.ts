/**
 * ADN Phase 2 — Chest Engine
 * Chest tier roll ve ödül hesaplama.
 */
export type ChestTier = "common" | "rare" | "epic" | "legendary";

/**
 * luck: 0-1 arası prestige/upgrade'den gelen şans bonusu
 */
export function rollChestTier(luck = 0): ChestTier {
  const roll = Math.random();
  const legendary = 0.012 + luck * 0.004;
  const epic      = 0.055 + luck * 0.012;
  const rare      = 0.18  + luck * 0.02;

  if (roll < legendary)              return "legendary";
  if (roll < legendary + epic)       return "epic";
  if (roll < legendary + epic + rare) return "rare";
  return "common";
}

export function openChest(tier: ChestTier) {
  const rewardMap = {
    common:    { coins: [60,   150]  as [number,number], gems: [0, 1]  as [number,number], boostChance: 0.04 },
    rare:      { coins: [180,  480]  as [number,number], gems: [1, 4]  as [number,number], boostChance: 0.10 },
    epic:      { coins: [520,  1400] as [number,number], gems: [3, 10] as [number,number], boostChance: 0.18 },
    legendary: { coins: [1600, 4200] as [number,number], gems: [8, 24] as [number,number], boostChance: 0.32 },
  };

  const r = rewardMap[tier];
  const rand = (min: number, max: number) => Math.floor(min + Math.random() * (max - min + 1));

  return {
    tier,
    coins: rand(r.coins[0], r.coins[1]),
    gems: rand(r.gems[0], r.gems[1]),
    boostGranted: Math.random() < r.boostChance,
  };
}
