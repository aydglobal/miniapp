import { prisma } from '../lib/prisma';

function subDays(date: Date, days: number) {
  return new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
}

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Number(((part / total) * 100).toFixed(1));
}

export async function getAnalyticsSummary() {
  const now = new Date();
  const d1 = subDays(now, 1);
  const d2 = subDays(now, 2);
  const d7 = subDays(now, 7);
  const d8 = subDays(now, 8);
  const d30 = subDays(now, 30);

  const [
    dau,
    newUsers,
    paidRevenue,
    totalTaps,
    chestOpens,
    prestigeCount,
    totalUsers,
    upgradedUsers,
    dailyClaimUsers,
    referralUsers,
    d1Cohort,
    d7Cohort
  ] = await Promise.all([
    prisma.user.count({ where: { lastSeenAt: { gte: d1 } } }),
    prisma.user.count({ where: { createdAt: { gte: d1 } } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'paid', createdAt: { gte: d30 } }
    }),
    prisma.user.aggregate({
      _sum: { totalTaps: true }
    }),
    prisma.userChest.count({ where: { status: 'opened', openedAt: { gte: d30 } } }),
    prisma.user.count({ where: { prestigePower: { gt: 0 } } }),
    prisma.user.count(),
    prisma.user.count({ where: { ownedUpgrades: { some: {} } } }),
    prisma.user.count({ where: { lastDailyClaimAt: { not: null } } }),
    prisma.user.count({ where: { referralsSent: { some: {} } } }),
    prisma.user.findMany({
      where: { createdAt: { gte: d2, lt: d1 } },
      select: { id: true }
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: d8, lt: d7 } },
      select: { id: true }
    })
  ]);

  const d1Ids = d1Cohort.map((item) => item.id);
  const d7Ids = d7Cohort.map((item) => item.id);

  const [d1Retained, d7Retained] = await Promise.all([
    d1Ids.length ? prisma.user.count({ where: { id: { in: d1Ids }, lastSeenAt: { gte: d1 } } }) : 0,
    d7Ids.length ? prisma.user.count({ where: { id: { in: d7Ids }, lastSeenAt: { gte: d7 } } }) : 0
  ]);

  return {
    totals: {
      dau,
      newUsers,
      revenueUsd: Number(paidRevenue._sum.amount || 0),
      taps: totalTaps._sum.totalTaps || 0,
      chestOpens,
      prestigeCount
    },
    retention: {
      d1: pct(d1Retained, d1Ids.length),
      d7: pct(d7Retained, d7Ids.length)
    },
    topFunnels: [
      { key: 'tap_to_first_upgrade', conversionRate: pct(upgradedUsers, totalUsers) },
      { key: 'first_upgrade_to_daily_claim', conversionRate: pct(dailyClaimUsers, Math.max(upgradedUsers, 1)) },
      { key: 'daily_claim_to_network_expansion', conversionRate: pct(referralUsers, Math.max(dailyClaimUsers, 1)) },
      { key: 'network_to_reboot_ready', conversionRate: pct(prestigeCount, Math.max(referralUsers, 1)) }
    ]
  };
}

export async function getMetricsTrend(days: number) {
  const results = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = subDays(now, i + 1);
    const dayEnd = subDays(now, i);

    const [dau, newUsers, revenue] = await Promise.all([
      prisma.user.count({ where: { lastSeenAt: { gte: dayStart, lt: dayEnd } } }),
      prisma.user.count({ where: { createdAt: { gte: dayStart, lt: dayEnd } } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'paid', createdAt: { gte: dayStart, lt: dayEnd } }
      })
    ]);

    const revenueTotal = Number(revenue._sum.amount || 0);
    results.push({
      date: dayStart.toISOString().slice(0, 10),
      dau,
      newUsers,
      revenue: revenueTotal,
      arpu: dau > 0 ? Number((revenueTotal / dau).toFixed(4)) : 0
    });
  }

  return results;
}

export async function getSegmentedUsers(filter: {
  minLevel?: number;
  maxLevel?: number;
  minSpend?: number;
  segment?: string;
  limit?: number;
}) {
  const where: Record<string, unknown> = {};

  if (filter.minLevel !== undefined || filter.maxLevel !== undefined) {
    where.level = {};
    if (filter.minLevel !== undefined) (where.level as Record<string, number>).gte = filter.minLevel;
    if (filter.maxLevel !== undefined) (where.level as Record<string, number>).lte = filter.maxLevel;
  }

  if (filter.segment) {
    where.engagementScore = { is: { segment: filter.segment } };
  }

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      displayName: true,
      username: true,
      level: true,
      totalLifetimeCoins: true,
      createdAt: true,
      lastSeenAt: true,
      engagementScore: { select: { segment: true, engagementScore: true } }
    },
    orderBy: { totalLifetimeCoins: 'desc' },
    take: filter.limit ?? 100
  });
}

export async function calculateARPU(days = 1) {
  const since = subDays(new Date(), days);
  const [dau, revenue] = await Promise.all([
    prisma.user.count({ where: { lastSeenAt: { gte: since } } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'paid', createdAt: { gte: since } }
    })
  ]);
  const total = Number(revenue._sum.amount || 0);
  return { dau, revenue: total, arpu: dau > 0 ? Number((total / dau).toFixed(4)) : 0 };
}

export async function calculateLTV() {
  const result = await prisma.payment.aggregate({
    _avg: { amount: true },
    where: { status: 'paid' }
  });
  return Number(result._avg.amount || 0);
}

export async function detectAnomalies() {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const dayBefore = subDays(today, 2);

  const [todayDau, yesterdayDau] = await Promise.all([
    prisma.user.count({ where: { lastSeenAt: { gte: yesterday } } }),
    prisma.user.count({ where: { lastSeenAt: { gte: dayBefore, lt: yesterday } } })
  ]);

  const anomalies: { metric: string; drop: number; alert: string }[] = [];

  if (yesterdayDau > 0) {
    const drop = (yesterdayDau - todayDau) / yesterdayDau;
    if (drop >= 0.2) {
      anomalies.push({
        metric: 'dau',
        drop: Number((drop * 100).toFixed(1)),
        alert: `DAU dropped ${(drop * 100).toFixed(1)}% vs previous day`
      });
    }
  }

  return anomalies;
}
