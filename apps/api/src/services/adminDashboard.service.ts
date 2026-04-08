import { prisma } from '../lib/prisma';

function subDays(date: Date, days: number) {
  return new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
}

export async function getAdminDashboardSummary() {
  const now = new Date();
  const d1 = subDays(now, 1);
  const d30 = subDays(now, 30);

  const [
    totalUsers,
    activeUsers24h,
    bannedUsers,
    openFraudCases,
    suspiciousUsers,
    recentRevenue,
    premiumOrders,
    boostPurchases
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { lastSeenAt: { gte: d1 } } }),
    prisma.user.count({ where: { status: 'banned' } }),
    prisma.fraudCase.count({ where: { status: { in: ['open', 'reviewing'] } } }),
    prisma.user.count({ where: { suspiciousScore: { gte: 60 } } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'paid', createdAt: { gte: d30 } }
    }),
    prisma.payment.count({ where: { status: 'paid', createdAt: { gte: d30 } } }),
    prisma.boostLog.count({ where: { action: { in: ['buy', 'level_up'] }, createdAt: { gte: d30 } } })
  ]);

  return {
    totalUsers,
    activeUsers24h,
    bannedUsers,
    openFraudCases,
    suspiciousUsers,
    last30dRevenue: recentRevenue._sum.amount || 0,
    premiumOrders,
    boostPurchases,
    generatedAt: now.toISOString()
  };
}

export async function getAdminDashboardCharts() {
  const days = 14;
  const start = subDays(new Date(), days - 1);

  const [users, payments, fraudCases, boostLogs] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.payment.findMany({
      where: { status: 'paid', createdAt: { gte: start } },
      select: { createdAt: true, amount: true },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.fraudCase.findMany({
      where: { detectedAt: { gte: start } },
      select: { detectedAt: true },
      orderBy: { detectedAt: 'asc' }
    }),
    prisma.boostLog.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true, action: true },
      orderBy: { createdAt: 'asc' }
    })
  ]);

  const buckets = Array.from({ length: days }).map((_, index) => {
    const date = subDays(new Date(), days - 1 - index).toISOString().slice(0, 10);
    return { date, newUsers: 0, paidRevenue: 0, fraudCases: 0, boostPurchases: 0 };
  });

  const map = new Map(buckets.map((bucket) => [bucket.date, bucket]));

  for (const item of users) {
    const bucket = map.get(item.createdAt.toISOString().slice(0, 10));
    if (bucket) bucket.newUsers += 1;
  }

  for (const item of payments) {
    const bucket = map.get(item.createdAt.toISOString().slice(0, 10));
    if (bucket) bucket.paidRevenue += Number(item.amount || 0);
  }

  for (const item of fraudCases) {
    const bucket = map.get(item.detectedAt.toISOString().slice(0, 10));
    if (bucket) bucket.fraudCases += 1;
  }

  for (const item of boostLogs) {
    const bucket = map.get(item.createdAt.toISOString().slice(0, 10));
    if (bucket && (item.action === 'buy' || item.action === 'level_up')) bucket.boostPurchases += 1;
  }

  return buckets;
}
