export const MONETIZATION_PRODUCTS = {
  boost_tap_x2_pack: {
    label: "2x Tap Pack",
    priceStars: 49,
    grantType: "boost",
    grantKey: "tap_x2",
    quantity: 1,
  },
  premium_battle_pass: {
    label: "Premium Battle Pass",
    priceStars: 199,
    grantType: "battle_pass",
    grantKey: "season_premium_pass",
    quantity: 1,
  },
  ultra_chest: {
    label: "Ultra Chest",
    priceStars: 99,
    grantType: "chest",
    grantKey: "ultra_chest",
    quantity: 1,
  },
  ad_free_30d: {
    label: "Ad-Free 30D",
    priceStars: 79,
    grantType: "ad_free",
    grantKey: "ad_free_30d",
    quantity: 1,
  },
} as const;

export const WITHDRAWAL_RULES = {
  ton: {
    minAmount: 1,
    cooldownHours: 24,
  },
  usdt: {
    minAmount: 5,
    cooldownHours: 24,
  },
};
