export type ProfileDto = {
  success: boolean;
  user: {
    id: string;
    coins: number;
    energy: number;
    energyMax: number;
    level: number;
    xp: number;
    xpMax: number;
    passiveIncomePerHour: number;
    isAdmin?: boolean;
  };
};

export type TapDto = {
  success: boolean;
  reward: number;
  coins: number;
  energy: number;
  combo?: number;
  isCrit?: boolean;
};

export type ShopItem = {
  id: string;
  name: string;
  level: number;
  price: number;
  incomeDelta: number;
  locked?: boolean;
  lockReason?: string;
};

export type ShopDto = {
  success: boolean;
  items: ShopItem[];
};

export type MissionDto = {
  id: string;
  title: string;
  progress: number;
  max: number;
  rewardLabel: string;
  isClaimable: boolean;
};

export type MissionsResponse = {
  success: boolean;
  items: MissionDto[];
};

export type ReferralResponse = {
  success: boolean;
  code: string;
  total: number;
  active: number;
  pendingReward: number;
};

export type LeaderboardRow = {
  rank: number;
  name: string;
  score: number;
  isMe?: boolean;
};

export type LeaderboardResponse = {
  success: boolean;
  items: LeaderboardRow[];
};

export type ChestItem = {
  id: string;
  title: string;
  ready: boolean;
  rarityHint: string;
};

export type ChestResponse = {
  success: boolean;
  items: ChestItem[];
};

export type OpenChestResponse = {
  success: boolean;
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
  jackpot?: boolean;
  rewards: {
    adn: number;
    shards: number;
    boostMinutes: number;
  };
};

export type PrestigeSummaryResponse = {
  success: boolean;
  canPrestige: boolean;
  estimatedCore: number;
  estimatedPower: number;
  requirements: string[];
};

export type ClanResponse = {
  success: boolean;
  clan: {
    name: string;
    rank: number;
    score: number;
    members: number;
    nextGap: number;
  } | null;
};

export type SettingsResponse = {
  success: boolean;
  settings: {
    sound: boolean;
    haptics: boolean;
    notifications: boolean;
    ambient: boolean;
  };
};
