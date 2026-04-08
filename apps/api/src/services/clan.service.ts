import { prisma } from '../lib/prisma';
import { computeContributionTier } from './clanCompetition.service';

// Phase 3 — Clan season ödülleri
export const CLAN_SEASON_REWARDS = [
  { rank: 1, reward: 'legendary_chest_x3 + season_banner + 5000_ADN', label: '🥇 Şampiyon' },
  { rank: 2, reward: 'epic_chest_x2 + 2500_ADN',                      label: '🥈 Finalist' },
  { rank: 3, reward: 'rare_chest_x2 + 1200_ADN',                      label: '🥉 Yarı Final' },
] as const;

/** Haftalık clan skor sıralamasını döner */
export async function getWeeklyClanLeaderboard(limit = 10) {
  return prisma.clan.findMany({
    take: limit,
    orderBy: { totalScore: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      totalScore: true,
      _count: { select: { members: true } }
    }
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

async function ensureNoClanMembership(userId: string) {
  const existing = await prisma.clanMember.findUnique({
    where: { userId }
  });

  if (existing) {
    throw new Error('User already belongs to a clan');
  }
}

export async function createClan(input: { userId: string; name: string; description?: string }) {
  await ensureNoClanMembership(input.userId);
  const baseSlug = slugify(input.name) || `clan-${Date.now()}`;
  let slug = baseSlug;
  let suffix = 1;

  while (await prisma.clan.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return prisma.$transaction(async (tx) => {
    const clan = await tx.clan.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        ownerId: input.userId
      }
    });

    await tx.clanMember.create({
      data: {
        clanId: clan.id,
        userId: input.userId,
        role: 'owner'
      }
    });

    return clan;
  });
}

export async function joinClan(input: { userId: string; clanId?: string; slug?: string }) {
  await ensureNoClanMembership(input.userId);
  const clan = input.clanId
    ? await prisma.clan.findUnique({ where: { id: input.clanId } })
    : input.slug
      ? await prisma.clan.findUnique({ where: { slug: input.slug } })
      : null;

  if (!clan) {
    throw new Error('Clan not found');
  }

  return prisma.clanMember.create({
    data: {
      clanId: clan.id,
      userId: input.userId
    }
  });
}

export async function recordClanContribution(userId: string, addedScore: number) {
  if (addedScore <= 0) return;

  const membership = await prisma.clanMember.findUnique({ where: { userId } });
  if (!membership) return;

  const [updatedMember] = await prisma.$transaction([
    prisma.clanMember.update({
      where: { id: membership.id },
      data: { contributedScore: { increment: addedScore } }
    }),
    prisma.clan.update({
      where: { id: membership.clanId },
      data: { totalScore: { increment: addedScore } }
    })
  ]);

  // Katkı tier'ını güncelle (role alanı yok, meta olarak log'a yazılabilir)
  const newScore = membership.contributedScore + addedScore;
  const tier = computeContributionTier(newScore);
  // tier bilgisi ileride ClanMember'a eklenebilir, şimdilik hesaplanıyor
  void tier;
}

export async function getClanOverview(userId: string) {
  const membership = await prisma.clanMember.findUnique({
    where: { userId },
    include: {
      clan: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                  username: true,
                  level: true,
                  coins: true
                }
              }
            },
            orderBy: { contributedScore: 'desc' }
          }
        }
      }
    }
  });

  const leaderboard = await prisma.clan.findMany({
    take: 8,
    orderBy: [{ totalScore: 'desc' }, { createdAt: 'asc' }],
    include: {
      members: {
        select: { id: true }
      }
    }
  });

  return {
    myClan: membership
      ? {
          id: membership.clan.id,
          name: membership.clan.name,
          slug: membership.clan.slug,
          role: membership.role,
          totalScore: membership.clan.totalScore,
          memberCount: membership.clan.members.length
        }
      : null,
    members:
      membership?.clan.members.map((member) => ({
        userId: member.userId,
        displayName: member.user.displayName,
        username: member.user.username,
        level: member.user.level,
        coins: member.user.coins,
        contributedScore: member.contributedScore,
        role: member.role
      })) || [],
    leaderboard: leaderboard.map((clan) => ({
      id: clan.id,
      name: clan.name,
      slug: clan.slug,
      totalScore: clan.totalScore,
      memberCount: clan.members.length
    }))
  };
}
