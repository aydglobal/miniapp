import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

function getUtcDayBoundaries(daysAgo = 1) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysAgo, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysAgo + 1, 0, 0, 0));
  return { start, end };
}

export async function runAnalyticsDailyJob() {
  const { start: yesterday, end: today } = getUtcDayBoundaries(1);

  logger.info({ day: yesterday.toISOString() }, 'analytics_daily_job_start');

  const [dau, newUsers, totalTaps, revenue] = await Promise.all([
    prisma.user.count({
      where: { lastSeenAt: { gte: yesterday, lt: today } }
    }),
    prisma.user.count({
      where: { createdAt: { gte: yesterday, lt: today } }
    }),
    prisma.walletLedgerEntry.count({
      where: { entryType: 'tap_reward', createdAt: { gte: yesterday, lt: today } }
    }),
    prisma.payment.aggregate({
      where: { status: 'paid', createdAt: { gte: yesterday, lt: today } },
      _sum: { amount: true }
    })
  ]);

  const totalRevenueXtr = revenue._sum.amount ?? 0;

  await prisma.analyticsDaily.upsert({
    where: { day: yesterday },
    update: { dau, newUsers, totalTaps, totalRevenueXtr },
    create: { day: yesterday, dau, newUsers, totalTaps, totalRevenueXtr }
  });

  logger.info({ day: yesterday.toISOString(), dau, newUsers, totalTaps, totalRevenueXtr }, 'analytics_daily_job_done');
  return { dau, newUsers, totalTaps, totalRevenueXtr };
}
