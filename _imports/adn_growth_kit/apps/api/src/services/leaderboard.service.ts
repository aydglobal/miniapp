import { prisma } from "../lib/prisma";

function trustMultiplierForUser(user: any) {
  if (user.isBanned) return 0;
  const suspicious = user.suspiciousScore || 0;
  if (suspicious >= 8) return 0.2;
  if (suspicious >= 5) return 0.5;
  if (suspicious >= 3) return 0.75;
  return 1;
}

export async function getGlobalLeaderboard(limit = 100) {
  const users = await prisma.user.findMany({
    where: { isBanned: false },
    select: {
      id: true,
      username: true,
      coins: true,
      suspiciousScore: true,
      isBanned: true,
    } as any,
    take: 500,
  });

  const ranked = users
    .map((u: any) => ({
      ...u,
      trustMultiplier: trustMultiplierForUser(u),
      effectiveScore: (u.coins || 0) * trustMultiplierForUser(u),
    }))
    .filter((u: any) => u.trustMultiplier > 0)
    .sort((a: any, b: any) => b.effectiveScore - a.effectiveScore)
    .slice(0, limit)
    .map((u: any, index: number) => ({
      rank: index + 1,
      userId: u.id,
      username: u.username,
      coins: u.coins,
      trustMultiplier: u.trustMultiplier,
      effectiveScore: u.effectiveScore,
    }));

  return ranked;
}

export async function snapshotLeaderboard() {
  const ranked = await getGlobalLeaderboard(100);

  await prisma.$transaction(
    ranked.map((row: any) =>
      prisma.leaderboardSnapshot.create({
        data: {
          boardType: "global",
          rank: row.rank,
          userId: row.userId,
          score: row.effectiveScore,
          trustMultiplier: row.trustMultiplier,
        },
      })
    )
  );

  return ranked.length;
}
