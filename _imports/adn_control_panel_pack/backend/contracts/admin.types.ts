export type AnalyticsSummaryResponse = {
  success: true;
  data: {
    totals: {
      dau: number;
      newUsers: number;
      revenueUsd: number;
      taps: number;
      chestOpens: number;
      prestigeCount: number;
    };
    retention: {
      d1: number;
      d7: number;
    };
    topFunnels: Array<{
      key: string;
      conversionRate: number;
    }>;
  };
};

export type LiveTuningResponse = {
  success: true;
  data: {
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
};
