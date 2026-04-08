export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export function rollWeightedRarity() : Rarity {
  const roll = Math.random() * 100;
  if (roll < 55) return "common";
  if (roll < 80) return "rare";
  if (roll < 92) return "epic";
  if (roll < 98) return "legendary";
  return "mythic";
}

export function rollJackpot() {
  return Math.random() < 0.0035;
}

export function buildChestRewards(rarity: Rarity) {
  switch (rarity) {
    case "mythic":
      return { adn: 5000, shards: 25, boostMinutes: 120 };
    case "legendary":
      return { adn: 2200, shards: 10, boostMinutes: 60 };
    case "epic":
      return { adn: 900, shards: 4, boostMinutes: 30 };
    case "rare":
      return { adn: 350, shards: 1, boostMinutes: 15 };
    default:
      return { adn: 120, shards: 0, boostMinutes: 0 };
  }
}
