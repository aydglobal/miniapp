export function computeClanWeeklyScore(input: {
  taps: number;
  missionPoints: number;
  referrals: number;
  chestPoints: number;
  eventPoints: number;
}) {
  return (
    input.taps * 1 +
    input.missionPoints * 3 +
    input.referrals * 50 +
    input.chestPoints * 5 +
    input.eventPoints * 4
  );
}

export function computeContributionTier(score: number) {
  if (score >= 50000) return 'mvp';
  if (score >= 15000) return 'elite';
  if (score >= 5000) return 'core';
  return 'member';
}
