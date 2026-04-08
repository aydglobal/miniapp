import { prisma } from '../lib/prisma';
import { getBoostPrice, type BoostKey } from '../config/boosts';

export async function resolveBoostPriceForUser(userId: string, boostKey: BoostKey, currentLevel: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pricingVariant: true }
  });

  const base = getBoostPrice(boostKey, currentLevel);
  if (!user) {
    return { price: base, variant: 'control', multiplier: 1 };
  }

  const override = await prisma.experimentPriceOverride.findFirst({
    where: {
      variant: user.pricingVariant,
      boostType: boostKey,
      isActive: true,
      OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }]
    }
  });

  const multiplier = override?.multiplier ?? 1;
  return {
    price: Math.max(1, Math.floor(base * multiplier)),
    variant: user.pricingVariant,
    multiplier
  };
}

export function assignPricingVariant(telegramId: string) {
  const buckets = ['control', 'cheap_10', 'expensive_10'] as const;
  const hash = [...telegramId].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return buckets[hash % buckets.length];
}
