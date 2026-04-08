export type LiveTuningConfig = {
  tap: {
    baseReward: number;
    critChance: number;
    critMultiplier: number;
    comboResetMs: number;
    comboTiers: Array<{ minHits: number; multiplier: number }>;
  };
  economy: {
    dailyRewardMultiplier: number;
    missionRewardMultiplier: number;
    shopPriceMultiplier: number;
    passiveIncomeMultiplier: number;
  };
  loot: {
    freeChestCooldownHours: number;
    jackpotChance: number;
    legendaryWeight: number;
    mythicWeight: number;
  };
};

const liveTuningConfig: LiveTuningConfig = {
  tap: {
    baseReward: 1,
    critChance: 0.04,
    critMultiplier: 4.5,
    comboResetMs: 2200,
    comboTiers: [
      { minHits: 5, multiplier: 1.15 },
      { minHits: 15, multiplier: 1.35 },
      { minHits: 30, multiplier: 1.7 },
      { minHits: 50, multiplier: 2.2 }
    ]
  },
  economy: {
    dailyRewardMultiplier: 1,
    missionRewardMultiplier: 1,
    shopPriceMultiplier: 1,
    passiveIncomeMultiplier: 1
  },
  loot: {
    freeChestCooldownHours: 4,
    jackpotChance: 0.0035,
    legendaryWeight: 6,
    mythicWeight: 2
  }
};

export function getLiveTuningConfig() {
  return structuredClone(liveTuningConfig);
}

export function updateLiveTuningConfig(patch: Partial<LiveTuningConfig>) {
  if (patch.tap) {
    liveTuningConfig.tap = {
      ...liveTuningConfig.tap,
      ...patch.tap,
      comboTiers: patch.tap.comboTiers ?? liveTuningConfig.tap.comboTiers
    };
  }

  if (patch.economy) {
    liveTuningConfig.economy = {
      ...liveTuningConfig.economy,
      ...patch.economy
    };
  }

  if (patch.loot) {
    liveTuningConfig.loot = {
      ...liveTuningConfig.loot,
      ...patch.loot
    };
  }

  return getLiveTuningConfig();
}
