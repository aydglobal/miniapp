export function isSelfReferral(inviterUserId: string, invitedUserId: string) {
  return inviterUserId === invitedUserId;
}

export function computeReferralQuality(input: {
  taps7d: number;
  sessions7d: number;
  currentLevel: number;
  purchases30d: number;
  suspiciousScore?: number;
}) {
  let quality = 0;
  quality += Math.min(input.taps7d / 50, 35);
  quality += Math.min(input.sessions7d * 6, 25);
  quality += Math.min(input.currentLevel * 2, 20);
  quality += Math.min(input.purchases30d * 8, 20);

  if ((input.suspiciousScore || 0) > 0) {
    quality -= Math.min((input.suspiciousScore || 0) * 5, 30);
  }

  return Math.max(0, Math.min(100, quality));
}

export function isReferralQualified(qualityScore: number) {
  return qualityScore >= 40;
}
