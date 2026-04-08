import { prisma } from '../lib/prisma';
import { ADN_SHOP_CARDS, getFeaturedShopCards, getShopCard } from '../config/adnEconomy';
import { getLiveTuningConfig } from './adminConfig.service';
import { getCardCurrentHourly, getPassiveIncomeDelta, resolveGameplayState } from './economyRuntime.service';
import { writeEconomyEvent } from './economyLedger.service';
import { progressMissionsForEvent } from './mission.service';
import { markTutorialStep } from './onboarding.service';

function getAdjustedShopPrice(basePrice: number) {
  return Math.max(1, Math.floor(basePrice * getLiveTuningConfig().economy.shopPriceMultiplier));
}

export async function getShopView(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { ownedUpgrades: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const gameplay = resolveGameplayState(user, user.ownedUpgrades);
  const cards = ADN_SHOP_CARDS.map((card) => {
    const owned = user.ownedUpgrades.find((item) => item.cardKey === card.id);
    const currentLevel = owned?.level ?? 0;
    const currentTier = card.tiers.find((tier) => tier.tier === currentLevel) ?? null;
    const nextTier = card.tiers.find((tier) => tier.tier === currentLevel + 1) ?? null;

    return {
      id: card.id,
      name: card.name,
      category: card.category,
      unlockLevel: card.unlockLevel,
      secondaryEffect: card.secondaryEffect,
      unlocked: gameplay.level >= card.unlockLevel,
      level: currentLevel,
      currentHourly: currentTier?.addedHourlyADN ?? 0,
      nextTier: nextTier
        ? {
            tier: nextTier.tier,
            costADN: getAdjustedShopPrice(nextTier.costADN),
            addedHourlyADN: nextTier.addedHourlyADN,
            deltaHourly: getPassiveIncomeDelta(currentTier?.addedHourlyADN ?? 0, nextTier.addedHourlyADN),
            paybackHours: nextTier.paybackHours,
            phase: nextTier.phase
          }
        : null
    };
  });

  return {
    level: gameplay.level,
    featured: getFeaturedShopCards(gameplay.level, 8).map((card) => ({
      id: card.id,
      name: card.name,
      category: card.category,
      unlockLevel: card.unlockLevel,
      tier: 1,
      costADN: card.tiers[0].costADN,
      addedHourlyADN: card.tiers[0].addedHourlyADN,
      paybackHours: card.tiers[0].paybackHours,
      secondaryEffect: card.secondaryEffect
    })),
    cards
  };
}

export async function purchaseUpgrade(userId: string, cardKey: string) {
  return upgradeInternal(userId, cardKey);
}

export async function upgradeOwnedCard(userId: string, cardKey: string) {
  return upgradeInternal(userId, cardKey);
}

async function upgradeInternal(userId: string, cardKey: string) {
  const card = getShopCard(cardKey);
  if (!card) {
    throw new Error('Card not found');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { ownedUpgrades: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const gameplay = resolveGameplayState(user, user.ownedUpgrades);
  if (gameplay.level < card.unlockLevel) {
    throw new Error(`Card unlocks at level ${card.unlockLevel}`);
  }

  const owned = user.ownedUpgrades.find((item) => item.cardKey === cardKey);
  const currentLevel = owned?.level ?? 0;
  const nextTier = card.tiers.find((tier) => tier.tier === currentLevel + 1);

  if (!nextTier) {
    throw new Error('Max level reached');
  }

  const adjustedPrice = getAdjustedShopPrice(nextTier.costADN);

  if (user.coins < adjustedPrice) {
    throw new Error('Not enough coins');
  }

  const currentHourly = getCardCurrentHourly(card, currentLevel);
  const deltaHourly = getPassiveIncomeDelta(currentHourly, nextTier.addedHourlyADN);

  const updatedUser = await prisma.$transaction(async (tx) => {
    const nextUser = await tx.user.update({
      where: { id: userId },
      data: {
        coins: { decrement: adjustedPrice },
        passiveIncomePerHour: { increment: deltaHourly }
      }
    });

    if (owned) {
      await tx.userUpgrade.update({
        where: { id: owned.id },
        data: {
          level: nextTier.tier,
          totalHourlyGain: nextTier.addedHourlyADN
        }
      });
    } else {
      await tx.userUpgrade.create({
        data: {
          userId,
          cardKey,
          level: nextTier.tier,
          totalHourlyGain: nextTier.addedHourlyADN
        }
      });
    }

    return nextUser;
  });

  await progressMissionsForEvent(userId, 'purchase', { amount: 1, cardKey, tier: nextTier.tier });
  await markTutorialStep({ userId, step: 'firstUpgradeDone' }).catch(() => null);
  await writeEconomyEvent({
    userId,
    type: 'purchase_spend',
    amount: -adjustedPrice,
    reason: `${card.name} tier ${nextTier.tier}`,
    refType: 'shop_card',
    refId: card.id,
    meta: {
      deltaHourly,
      totalHourly: nextTier.addedHourlyADN
    }
  });

  return {
    cardKey,
    level: nextTier.tier,
    price: adjustedPrice,
    coins: updatedUser.coins,
    passiveIncomePerHour: updatedUser.passiveIncomePerHour,
    deltaHourly
  };
}
