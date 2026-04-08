import { prisma } from '../lib/prisma';
import { writeEconomyEvent } from './economyLedger.service';
import { BOOSTS, type BoostKey } from '../config/boosts';

export async function grantChest(input: {
  userId: string;
  source: string;
  rarity: string;
  rewardCoins: number;
  shards?: number;
  boostMinutes?: number;
}) {
  return prisma.userChest.create({
    data: {
      userId: input.userId,
      source: input.source,
      rarity: input.rarity,
      rewardCoins: input.rewardCoins,
      shards: input.shards || 0,
      boostMinutes: input.boostMinutes || 0
    }
  });
}

export async function getChestVault(userId: string) {
  const [items, summary] = await Promise.all([
    prisma.userChest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    }),
    prisma.userChest.groupBy({
      by: ['status'],
      where: { userId },
      _count: { _all: true }
    })
  ]);

  return {
    items,
    readyCount: summary.find((item) => item.status === 'ready')?._count._all || 0
  };
}

export async function openChest(userId: string, chestId: string) {
  const chest = await prisma.userChest.findFirst({ where: { id: chestId, userId } });
  if (!chest) throw new Error('Chest not found');
  if (chest.status !== 'ready') throw new Error('Chest is not ready');

  // Coins ödülü uygula
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      coins: { increment: chest.rewardCoins },
      xp: { increment: chest.rewardCoins },
      totalLifetimeCoins: { increment: chest.rewardCoins }
    }
  });

  // Boost ödülü uygula (boostMinutes > 0 ise tap_x2 boost ver)
  if (chest.boostMinutes > 0) {
    const boostKey: BoostKey = 'tap_x2';
    const cfg = BOOSTS[boostKey];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + chest.boostMinutes * 60_000);
    await prisma.userBoost.upsert({
      where: { userId_type: { userId, type: boostKey } },
      create: { userId, type: boostKey, level: 1, isActive: true, startsAt: now, expiresAt },
      update: { isActive: true, startsAt: now, expiresAt }
    }).catch(() => null);
  }

  await prisma.userChest.update({
    where: { id: chest.id },
    data: { status: 'opened', openedAt: new Date() }
  });

  await writeEconomyEvent({
    userId,
    type: 'chest_reward',
    amount: chest.rewardCoins,
    reason: chest.rarity,
    refType: 'chest',
    refId: chest.id,
    meta: { source: chest.source, shards: chest.shards, boostMinutes: chest.boostMinutes }
  });

  return {
    chestId: chest.id,
    rarity: chest.rarity,
    rewardCoins: chest.rewardCoins,
    shards: chest.shards,
    boostMinutes: chest.boostMinutes,
    coins: updatedUser.coins,
    reward: { rewardCoins: chest.rewardCoins, rarity: chest.rarity, shards: chest.shards, boostMinutes: chest.boostMinutes }
  };
}
