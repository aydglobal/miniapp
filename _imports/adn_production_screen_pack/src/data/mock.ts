export const profile = {
  adn: 14280,
  hourly: 3420,
  energy: 92,
  energyMax: 100,
  level: 12,
  xp: 420,
  xpMax: 800,
  combo: 1.35,
  event: "Lucky Chest Night",
};

export const upgrades = [
  { id: "market", name: "ADN Market", level: 7, price: 1200, income: 180 },
  { id: "node", name: "Nebula Node", level: 4, price: 2800, income: 460 },
  { id: "lab", name: "Crit Lab", level: 2, price: 5100, income: 920 },
];

export const missions = [
  { id: "m1", title: "20 tap yap", progress: 12, max: 20, reward: "120 ADN" },
  { id: "m2", title: "1 upgrade al", progress: 0, max: 1, reward: "Free Chest" },
  { id: "m3", title: "1 referral getir", progress: 0, max: 1, reward: "x2 Boost 15m" },
];

export const referrals = {
  code: "ADN-NEBULA-77",
  total: 6,
  active: 3,
  pendingReward: 420,
};

export const leaderboard = [
  { rank: 1, name: "NovaMiner", score: 928000 },
  { rank: 2, name: "ADN Whale", score: 886000 },
  { rank: 3, name: "HyperTap", score: 852000 },
  { rank: 47, name: "You", score: 142800 },
];

export const chests = [
  { id: "c1", title: "Free Chest", ready: true, rarityHint: "Up to Epic" },
  { id: "c2", title: "Mission Chest", ready: false, rarityHint: "Up to Legendary" },
  { id: "c3", title: "Clan Chest", ready: false, rarityHint: "Weekly Reward" },
];

export const clan = {
  name: "ADN Nebula",
  rank: 8,
  score: 152300,
  members: 24,
  nextGap: 9400,
};

export const settings = {
  sound: true,
  haptics: true,
  notifications: true,
  ambient: false,
};
