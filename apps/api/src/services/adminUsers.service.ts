import { prisma } from '../lib/prisma';

export async function listUsers(params: {
  q?: string;
  status?: string;
  skip: number;
  limit: number;
}) {
  const where: any = {};

  if (params.status) where.status = params.status;
  if (params.q) {
    where.OR = [
      { username: { contains: params.q, mode: 'insensitive' } },
      { telegramId: { contains: params.q, mode: 'insensitive' } },
      { id: { contains: params.q, mode: 'insensitive' } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        telegramId: true,
        username: true,
        displayName: true,
        coins: true,
        totalTaps: true,
        suspiciousScore: true,
        trustScore: true,
        status: true,
        bannedAt: true,
        banReason: true,
        isFraudLocked: true,
        createdAt: true,
        lastSeenAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip: params.skip,
      take: params.limit
    }),
    prisma.user.count({ where })
  ]);

  return { items, total };
}

async function logAdminAction(adminId: string, targetUserId: string, action: string, reason?: string) {
  await prisma.adminAction.create({
    data: { adminId, targetUserId, action, reason }
  });
}

export async function banUser(params: { adminId: string; userId: string; reason?: string }) {
  const updated = await prisma.user.update({
    where: { id: params.userId },
    data: {
      status: 'banned',
      isFraudLocked: true,
      bannedAt: new Date(),
      banReason: params.reason
    }
  });

  await logAdminAction(params.adminId, params.userId, 'ban_user', params.reason);
  return updated;
}

export async function unbanUser(params: { adminId: string; userId: string; reason?: string }) {
  const updated = await prisma.user.update({
    where: { id: params.userId },
    data: {
      status: 'active',
      isFraudLocked: false,
      bannedAt: null,
      banReason: null
    }
  });

  await logAdminAction(params.adminId, params.userId, 'unban_user', params.reason);
  return updated;
}

export async function lockFraudUser(params: { adminId: string; userId: string; reason?: string }) {
  const updated = await prisma.user.update({
    where: { id: params.userId },
    data: {
      status: 'locked',
      isFraudLocked: true,
      banReason: params.reason
    }
  });

  await logAdminAction(params.adminId, params.userId, 'fraud_lock_user', params.reason);
  return updated;
}
