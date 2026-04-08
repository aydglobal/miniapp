import { prisma } from "../lib/prisma";
import { syncPassiveIncome } from "./income.service";
import { syncLevelState } from "./level.service";
import { getDailyState } from "./dailyReward.service";
import { getMissionBoard } from "./mission.service";

export async function getProfileState(userId: string) {
  await syncPassiveIncome(userId);
  const levelState = await syncLevelState(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedUpgrades: true,
      activeBoosts: true,
      referralProfile: true,
    },
  });

  if (!user) throw new Error("User not found");

  const daily = await getDailyState(userId);
  const missions = await getMissionBoard(userId);

  return {
    user: {
      id: user.id,
      username: user.username,
      level: levelState.level,
      xp: user.xp,
      coins: user.coins,
      adnBalance: user.adnBalance,
      energy: user.energy,
      energyMax: user.energyMax,
      passiveIncomePerHour: user.passiveIncomePerHour,
      isAdmin: user.isAdmin,
    },
    upgrades: user.ownedUpgrades,
    boosts: user.activeBoosts,
    referral: user.referralProfile,
    daily,
    missions,
    unlocks: levelState.unlocks,
  };
}
