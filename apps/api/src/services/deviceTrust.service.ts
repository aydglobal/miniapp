import { prisma } from '../lib/prisma';

export async function registerDevice(params: {
  userId: string;
  fingerprint: string;
  platform?: string;
  appVersion?: string;
}) {
  const existing = await prisma.userDevice.findUnique({
    where: {
      userId_fingerprint: {
        userId: params.userId,
        fingerprint: params.fingerprint
      }
    }
  });

  if (existing) {
    return prisma.userDevice.update({
      where: { id: existing.id },
      data: {
        lastSeenAt: new Date(),
        totalSessions: { increment: 1 },
        platform: params.platform ?? existing.platform ?? undefined,
        appVersion: params.appVersion ?? existing.appVersion ?? undefined
      }
    });
  }

  return prisma.userDevice.create({
    data: {
      userId: params.userId,
      fingerprint: params.fingerprint,
      platform: params.platform,
      appVersion: params.appVersion
    }
  });
}
