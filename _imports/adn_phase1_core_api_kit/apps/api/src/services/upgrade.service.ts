import { prisma } from "../lib/prisma";
import { getUpgradeCatalog } from "../static/upgrades.catalog";
import { writeEconomyEvent } from "./economyLedger.service";

export async function getShopView(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { ownedUpgrades: true },
  });
  if (!user) throw new Error("User not found");

  const catalog = getUpgradeCatalog();
  return {
    cards: catalog.map((card) => {
      const owned = user.ownedUpgrades.find((x) => x.cardKey === card.key);
      const level = owned?.level ?? 0;
      const nextLevel = level + 1;
      const nextPrice = card.basePrice * Math.pow(card.priceMultiplier, level);
      return {
        ...card,
        level,
        nextLevel,
        nextPrice: Math.floor(nextPrice),
      };
    }),
  };
}

export async function purchaseUpgrade(userId: string, cardKey: string) {
  return upgradeInternal(userId, cardKey, true);
}

export async function upgradeOwnedCard(userId: string, cardKey: string) {
  return upgradeInternal(userId, cardKey, false);
}

async function upgradeInternal(userId: string, cardKey: string, allowFirstPurchase: boolean) {
  const card = getUpgradeCatalog().find((x) => x.key === cardKey);
  if (!card) throw new Error("Card not found");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { ownedUpgrades: true },
  });
  if (!user) throw new Error("User not found");

  let owned = user.ownedUpgrades.find((x) => x.cardKey === cardKey);
  if (!owned && !allowFirstPurchase) throw new Error("Upgrade not owned");

  const currentLevel = owned?.level ?? 0;
  if (currentLevel >= card.maxLevel) throw new Error("Max level reached");

  const price = Math.floor(card.basePrice * Math.pow(card.priceMultiplier, currentLevel));
  if (user.coins < price) throw new Error("Not enough coins");

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        coins: { decrement: price },
        passiveIncomePerHour: { increment: card.incomePerLevel },
      },
    });

    if (!owned) {
      await tx.userUpgrade.create({
        data: {
          userId,
          cardKey,
          level: 1,
        },
      });
    } else {
      await tx.userUpgrade.update({
        where: { id: owned.id },
        data: { level: { increment: 1 } },
      });
    }
  });

  await writeEconomyEvent({
    userId,
    type: "upgrade_purchase",
    amount: -price,
    currency: "COIN",
    meta: { cardKey, nextLevel: currentLevel + 1 },
  });

  return {
    cardKey,
    level: currentLevel + 1,
    price,
  };
}
