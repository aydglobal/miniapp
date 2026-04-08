import { prisma } from '../lib/prisma';

export async function evaluateRiskSignals(params: {
  userId: string;
  ipHash?: string | null;
  deviceFingerprint?: string | null;
  tapsPerMinute?: number;
  referralsCreatedToday?: number;
}) {
  const signals: string[] = [];
  let risk = 0;

  if (params.tapsPerMinute && params.tapsPerMinute > 420) {
    signals.push('impossible_tap_rate');
    risk += 30;
  }

  if (params.referralsCreatedToday && params.referralsCreatedToday > 8) {
    signals.push('referral_spike');
    risk += 20;
  }

  if (params.deviceFingerprint) {
    const otherUsersOnDevice = await prisma.user.count({
      where: {
        deviceFingerprint: params.deviceFingerprint,
        id: { not: params.userId }
      }
    });
    if (otherUsersOnDevice >= 2) {
      signals.push('multi_account_same_device');
      risk += 25;
    }
  }

  if (params.ipHash) {
    const otherUsersOnIp = await prisma.user.count({
      where: {
        ipHash: params.ipHash,
        id: { not: params.userId }
      }
    });
    if (otherUsersOnIp >= 4) {
      signals.push('ip_cluster');
      risk += 20;
    }
  }

  return { risk, signals };
}

export async function applyRiskOutcome(userId: string, risk: number, signals: string[]) {
  if (risk <= 0) return;

  const lockUntil =
    risk >= 50
      ? new Date(Date.now() + 60 * 60 * 1000)
      : risk >= 30
        ? new Date(Date.now() + 15 * 60 * 1000)
        : null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      suspiciousScore: { increment: risk },
      fraudLockedUntil: lockUntil ?? undefined
    }
  });

  if (signals.length > 0) {
    await prisma.fraudCase.create({
      data: {
        userId,
        riskType: 'automated_signal',
        score: risk,
        title: 'Automated fraud signal batch',
        details: { risk, signals }
      }
    });
  }
}
