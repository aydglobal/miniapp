import { prisma } from '../lib/prisma';

const MULTI_ACCOUNT_THRESHOLD = 3;
const SUSPICIOUS_SCORE_THRESHOLD = 80;

export async function detectMultiAccount(fingerprint: string, userId: string) {
  const devices = await prisma.userDevice.findMany({
    where: { fingerprint, trustStatus: { not: 'blocked' } },
    select: { userId: true }
  });

  const uniqueUsers = new Set(devices.map(d => d.userId));
  uniqueUsers.delete(userId);

  if (uniqueUsers.size >= MULTI_ACCOUNT_THRESHOLD) {
    await createFraudAlert(userId, 'multi_account', {
      fingerprint,
      linkedUserCount: uniqueUsers.size,
      linkedUserIds: Array.from(uniqueUsers)
    });
    return { detected: true, linkedCount: uniqueUsers.size };
  }

  return { detected: false, linkedCount: uniqueUsers.size };
}

export async function evaluateTapAnomaly(userId: string, tapPattern: {
  tapsInWindow: number;
  windowMs: number;
  avgInterval?: number;
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { suspiciousScore: true, tapPower: true }
  });
  if (!user) return 0;

  let score = user.suspiciousScore;
  const tapsPerSecond = tapPattern.tapsInWindow / (tapPattern.windowMs / 1000);

  // İnsan sınırı ~10 tap/sn, üstü şüpheli
  if (tapsPerSecond > 15) score += 20;
  else if (tapsPerSecond > 10) score += 10;

  // Çok düzenli aralıklar bot işareti
  if (tapPattern.avgInterval && tapPattern.avgInterval < 50) score += 15;

  score = Math.min(100, score);

  await prisma.user.update({
    where: { id: userId },
    data: { suspiciousScore: score }
  });

  if (score >= SUSPICIOUS_SCORE_THRESHOLD) {
    await createFraudAlert(userId, 'tap_anomaly', { tapsPerSecond, score });
  }

  return score;
}

export async function suspendAccount(userId: string, reason: string, adminId?: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isFraudLocked: true,
      fraudLockedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'banned',
      banReason: reason,
      bannedAt: new Date()
    }
  });

  if (adminId) {
    await prisma.adminAction.create({
      data: { adminId, targetUserId: userId, action: 'suspend', reason }
    });
  }
}

export async function createFraudAlert(
  userId: string,
  riskType: string,
  details?: Record<string, unknown>
) {
  return prisma.fraudCase.create({
    data: {
      userId,
      riskType,
      title: `Fraud detected: ${riskType}`,
      details: details ? JSON.parse(JSON.stringify(details)) : undefined,
      score: (details?.score as number) ?? 50,
      status: 'open'
    }
  });
}
