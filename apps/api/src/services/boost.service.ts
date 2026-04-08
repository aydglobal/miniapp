import { prisma } from '../lib/prisma';
import { BOOSTS, getBoostPrice, type BoostKey } from '../config/boosts';
import { resolveBoostPriceForUser } from '../lib/experimentPricing';
import { isBoostCurrentlyActive } from '../lib/boosts';

const BUY_COOLDOWN_MS = 3000;

export async function buyBoostWithCoins(userId: string, boostKey: BoostKey) {
  const cfg = BOOSTS[boostKey];

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    if (user.lastBoostBuyAt && Date.now() - user.lastBoostBuyAt.getTime() < BUY_COOLDOWN_MS) {
      const error = new Error('Too many purchase attempts');
      (error as any).statusCode = 429;
      throw error;
    }

    const boost = await tx.userBoost.upsert({
      where: { userId_type: { userId, type: boostKey } },
      create: {
        userId,
        type: boostKey,
        level: 0,
        isActive: false
      },
      update: {}
    });

    if (boost.level >= cfg.maxLevel) {
      const error = new Error('Boost max level reached');
      (error as any).statusCode = 400;
      throw error;
    }

    const pricing = await resolveBoostPriceForUser(userId, boostKey, boost.level);
    const price = pricing.price;
    if (user.coins < price) {
      const error = new Error('Not enough coins');
      (error as any).statusCode = 400;
      throw error;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + cfg.durationHours * 3600_000);
    const levelBefore = boost.level;
    const levelAfter = levelBefore + 1;
    const shouldResetTimer = !isBoostCurrentlyActive(boost);

    await tx.user.update({
      where: { id: userId },
      data: {
        coins: { decrement: price },
        lastBoostBuyAt: now
      }
    });

    const updatedBoost = await tx.userBoost.update({
      where: { id: boost.id },
      data: {
        level: levelAfter,
        isActive: true,
        startsAt: shouldResetTimer ? now : boost.startsAt,
        expiresAt: shouldResetTimer ? expiresAt : boost.expiresAt
      }
    });

    await tx.boostLog.create({
      data: {
        userId,
        boostType: boostKey,
        action: levelBefore === 0 ? 'buy' : 'level_up',
        source: 'coins',
        levelBefore,
        levelAfter,
        coinsSpent: price,
        meta: { keptExistingExpiry: !shouldResetTimer }
      }
    });

    return {
      success: true,
      boost: updatedBoost,
      price,
      pricingVariant: pricing.variant,
      keptExistingExpiry: !shouldResetTimer
    };
  });
}

export async function claimDailyFreeBoost(userId: string, boostKey: BoostKey) {
  const cfg = BOOSTS[boostKey];
  if (!cfg.freeClaimCooldownHours) throw new Error('This boost is not available for free claim');

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const cooldownMs = cfg.freeClaimCooldownHours * 3600_000;
    if (user.dailyFreeBoostClaimAt && Date.now() - user.dailyFreeBoostClaimAt.getTime() < cooldownMs) {
      const nextAt = new Date(user.dailyFreeBoostClaimAt.getTime() + cooldownMs);
      const error = new Error(`Free claim available at ${nextAt.toISOString()}`);
      (error as any).statusCode = 400;
      throw error;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + cfg.durationHours * 3600_000);
    const boost = await tx.userBoost.upsert({
      where: { userId_type: { userId, type: boostKey } },
      create: {
        userId,
        type: boostKey,
        level: 1,
        isActive: true,
        startsAt: now,
        expiresAt
      },
      update: {
        isActive: true,
        startsAt: now,
        expiresAt
      }
    });

    await tx.user.update({
      where: { id: userId },
      data: { dailyFreeBoostClaimAt: now }
    });

    await tx.boostLog.create({
      data: {
        userId,
        boostType: boostKey,
        action: 'free_claim',
        source: 'daily_free',
        levelBefore: boost.level,
        levelAfter: boost.level
      }
    });

    return { success: true, boost };
  });
}
