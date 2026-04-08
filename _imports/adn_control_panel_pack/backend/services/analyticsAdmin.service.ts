export function getAnalyticsSummary() {
  return {
    totals: {
      dau: 4821,
      newUsers: 713,
      revenueUsd: 842.4,
      taps: 922110,
      chestOpens: 1621,
      prestigeCount: 83,
    },
    retention: {
      d1: 42.8,
      d7: 18.4,
    },
    topFunnels: [
      { key: "tap_to_first_upgrade", conversionRate: 61.2 },
      { key: "first_upgrade_to_daily_claim", conversionRate: 48.7 },
      { key: "daily_claim_to_referral_copy", conversionRate: 22.1 },
      { key: "referral_copy_to_active_referral", conversionRate: 8.9 },
    ],
  };
}
