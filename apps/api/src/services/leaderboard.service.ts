import { prisma } from '../lib/prisma';

export async function getSafeLeaderboard(limit = 20) {
  const users = await prisma.user.findMany({
    take: Math.min(100, limit * 3),
    orderBy: [{ coins: 'desc' }],
    select: {
      id: true,
      displayName: true,
      username: true,
      coins: true,
      level: true,
      suspiciousScore: true,
      fraudFlags: true,
      referralRewardsGiven: true,
      payments: {
        where: { status: 'paid' },
        select: { id: true }
      }
    }
  });

  return users
    .filter((user) => user.suspiciousScore < 12)
    .filter((user) => !user.fraudFlags.includes('leaderboard_hidden'))
    .map((user) => ({
      ...user,
      trustScore: Math.max(0, 100 - user.suspiciousScore * 6 + Math.min(10, user.payments.length * 2))
    }))
    .sort((a, b) => {
      if (b.coins !== a.coins) return b.coins - a.coins;
      return b.trustScore - a.trustScore;
    })
    .slice(0, limit)
    .map(({ payments, ...user }, index) => ({ rank: index + 1, ...user }));
}
