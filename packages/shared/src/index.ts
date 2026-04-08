export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

export type PlayerProfile = {
  id: string;
  telegramId: string;
  displayName: string;
  username?: string | null;
  coins: number;
  xp?: number;
  energy: number;
  maxEnergy: number;
  level: number;
  tapPower: number;
  passiveIncomePerHour: number;
  pendingMiningCoins?: number;
  pendingPassiveIncome?: number;
  maxOfflineHours?: number;
  referralCode: string;
  isAdmin?: boolean;
  status?: string;
  trustScore?: number;
  suspiciousScore?: number;
  totalTaps?: number;
  dailyStreak?: number;
  tapNonce?: number;
  tapMultiplier?: number;
  regenMultiplier?: number;
  prestigeBonus?: number;
  critChance?: number;
  chestChance?: number;
  comboMultiplier?: number;
  unlocks?: string[];
  nextFeatureUnlock?: FeatureUnlockPreview | null;
  ownedUpgradeCount?: number;
  smartNotification?: string | null;
  activeOffer?: string | null;
  clan?: ClanSummary | null;
  dailyFreeBoostClaimAt?: string | null;
  boosts?: ActiveBoost[];
};

export type TapResult = {
  coins: number;
  energy: number;
  energyMax?: number;
  addedCoins: number;
  level: number;
  tapNonce?: number;
  tapMultiplier?: number;
  passiveIncomePerHour?: number;
  pendingMiningCoins?: number;
  criticalHit?: boolean;
  critMultiplier?: number;
  prestigeBonus?: number;
  comboMultiplier?: number;
  chest?: ChestDropResult | null;
  note?: string;
};

export type ActiveBoost = {
  type: BoostKey;
  level: number;
  expiresAt: string;
};

export type BoostKey = 'tap_x2' | 'energy_cap' | 'regen_x2';

export type BoostCatalogItem = {
  key: BoostKey;
  name: string;
  price: number;
  pricingVariant?: string;
  pricingMultiplier?: number;
  durationHours: number;
  value: number;
  maxLevel?: number;
  premiumStarsPrice?: number;
  freeClaimCooldownHours?: number;
};

export type WithdrawalRequest = {
  id: string;
  method: string;
  amountCoins: number;
  amountPayout: number;
  payoutAddress: string;
  status: string;
  riskScore: number;
  createdAt: string;
};

export type ReferralQuestProgress = {
  id: string;
  progress: number;
  completedAt?: string | null;
  template: {
    key: string;
    title: string;
    description: string;
    targetValue: number;
    rewardType: string;
    rewardValue: number;
  };
};

export type DynamicTaskAssignment = {
  id: string;
  title: string;
  description: string;
  category: string;
  source: string;
};

export type AirdropTask = {
  id: string;
  code: string;
  title: string;
  description: string;
  rewardPoints: number;
  completed: boolean;
  claimed: boolean;
};

export type AirdropSummary = {
  totalPoints: number;
  referralCount: number;
  referralPoints: number;
  estimatedTokens: number;
  completedTasks: number;
  claimable: boolean;
  minimumPoints: number;
};

export type AirdropDashboard = {
  user: PlayerProfile;
  summary: AirdropSummary;
  tasks: AirdropTask[];
  referralLink: string;
};

export type ClaimResult = {
  walletAddress: string;
  estimatedTokens: number;
  status: 'queued';
  message: string;
};

export type ChestDropResult = {
  dropped: boolean;
  tier: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  rewardCoins: number;
  shards?: number;
  boostMinutes?: number;
  jackpot?: boolean;
};

export type FeatureUnlockPreview = {
  player_level: number;
  feature_name: string;
  feature_type: string;
  unlock_copy: string;
};

export type MissionItem = {
  id: string;
  key: string;
  title: string;
  description: string;
  category: string;
  eventType: string;
  targetValue: number;
  progress: number;
  rewardCoins: number;
  rewardXp: number;
  status: string;
  completedAt?: string | null;
  rewardClaimedAt?: string | null;
};

export type MissionBoard = {
  segment: string;
  recommendation: {
    player_segment: string;
    primary_trigger: string;
    recommended_next_quest: string;
    reason: string;
    reward_mix: string;
    cooldown: string;
    when_to_avoid: string;
    notes: string;
    ai_prompt_hint: string | null;
  };
  missions: MissionItem[];
};

export type DailyState = {
  canClaim: boolean;
  streakDay: number;
  nextReward: number;
  multiplier: number;
  lastClaimAt?: string | null;
};

export type DailyClaimResult = {
  reward: number;
  coins: number;
  xp?: number;
  streak: number;
};

export type ShopTierPreview = {
  tier: number;
  costADN: number;
  addedHourlyADN: number;
  deltaHourly: number;
  paybackHours: number;
  phase: string;
};

export type ShopCardView = {
  id: string;
  name: string;
  category: string;
  unlockLevel: number;
  secondaryEffect: string;
  unlocked: boolean;
  level: number;
  currentHourly: number;
  nextTier: ShopTierPreview | null;
};

export type FeaturedShopCard = {
  id: string;
  name: string;
  category: string;
  unlockLevel: number;
  tier: number;
  costADN: number;
  addedHourlyADN: number;
  paybackHours: number;
  secondaryEffect: string;
};

export type ShopView = {
  level: number;
  featured: FeaturedShopCard[];
  cards: ShopCardView[];
};

export type ReferralOverview = {
  code: string;
  link: string;
  previewReward: number;
  activeOffer: string | null;
  smartNotification: string | null;
  totals: {
    total: number;
    pending: number;
    active: number;
    rewarded: number;
    blocked: number;
    eligibleRewardBalance: number;
  };
  invites: Array<{
    id: string;
    displayName: string;
    username?: string | null;
    level: number;
    status: string;
    coins: number;
    dailyStreak: number;
  }>;
};

export type ClanSummary = {
  id: string;
  name: string;
  slug: string;
  role: string;
  totalScore: number;
  memberCount: number;
};

export type ClanOverview = {
  myClan: ClanSummary | null;
  members: Array<{
    userId: string;
    displayName: string;
    username?: string | null;
    level: number;
    coins: number;
    contributedScore: number;
    role: string;
  }>;
  leaderboard: Array<{
    id: string;
    name: string;
    slug: string;
    totalScore: number;
    memberCount: number;
  }>;
};

export type ChestVaultItem = {
  id: string;
  source: string;
  rarity: string;
  rewardCoins: number;
  shards: number;
  boostMinutes: number;
  status: string;
  createdAt: string;
  openedAt?: string | null;
};

export type ChestVault = {
  items: ChestVaultItem[];
  readyCount: number;
};

export type PrestigeStatus = {
  canPrestige: boolean;
  totalLifetimeEarned: number;
  estimatedPower: number;
  estimatedCore: number;
  prestigePower: number;
  nebulaCore: number;
  metaSkills: Array<{
    key: string;
    name: string;
    level: number;
  }>;
  permanentBonus: {
    tapMultiplier: number;
    critChanceBonus: number;
    energyBonus: number;
    offlineCapBonus: number;
    clanContributionBonus: number;
  };
};
