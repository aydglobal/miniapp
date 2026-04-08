export function evaluateWithdrawalRisk(input: {
  suspiciousScore: number;
  referralCount: number;
  qualifiedReferralCount: number;
  amountCoins: number;
  accountAgeDays: number;
}) {
  let score = input.suspiciousScore;

  if (input.amountCoins > 250000) score += 15;
  if (input.accountAgeDays < 3) score += 25;
  if (input.referralCount >= 5 && input.qualifiedReferralCount === 0) score += 25;

  let action: 'approve_fast' | 'manual_review' | 'reject' = 'approve_fast';
  if (score >= 60) action = 'reject';
  else if (score >= 25) action = 'manual_review';

  return { riskScore: score, action };
}
