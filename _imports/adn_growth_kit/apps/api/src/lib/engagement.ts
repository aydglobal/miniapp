export function computeEngagement(input: {
  lastSeenAt: Date | null;
  sessions7d: number;
  taps7d: number;
  purchases30d: number;
  referrals30d: number;
}) {
  const now = Date.now();
  const daysSinceSeen = input.lastSeenAt
    ? (now - new Date(input.lastSeenAt).getTime()) / 86400000
    : 999;

  let score = 0;
  score += Math.min(input.sessions7d * 8, 40);
  score += Math.min(input.taps7d / 50, 25);
  score += Math.min(input.purchases30d * 12, 20);
  score += Math.min(input.referrals30d * 10, 15);
  score -= Math.min(daysSinceSeen * 8, 50);

  const engagementScore = Math.max(0, Math.min(100, score));
  const churnRisk = Math.max(0, Math.min(1, 1 - engagementScore / 100));

  let segment = "warm";
  if (engagementScore >= 70) segment = "hot";
  else if (engagementScore < 30) segment = "cold";
  if (input.purchases30d >= 3) segment = "whale";

  return { engagementScore, churnRisk, segment };
}
