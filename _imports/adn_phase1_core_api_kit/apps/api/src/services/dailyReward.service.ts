import { prisma } from "../lib/prisma";
import { progressMissionsForEvent } from "./mission.service";
import { writeEconomyEvent } from "./economyLedger.service";

const DAILY_REWARDS = [100, 150, 200, 300, 450, 650, 1000];

export async function getDailyState(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const today = new Date();
  const lastClaimAt = user.lastDailyClaimAt;
  const alreadyClaimedToday =
    !!lastClaimAt && lastClaimAt.toDateString() === today.toDateString();

  const streakDay = Math.max(1, Math.min(user.dailyStreak || 1, DAILY_REWARDS.length));
  return {
    canClaim: !alreadyClaimedToday,
    streakDay,
    nextReward: DAILY_REWARDS[streakDay - 1],
    lastClaimAt,
  };
}

export async function claimDailyReward(userId: string) {
  const state = await getDailyState(userId);
  if (!state.canClaim) throw new Error("Daily reward already claimed");

  const reward = state.nextReward;
  const today = new Date();

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      coins: { increment: reward },
      dailyStreak: { increment: 1 },
      lastDailyClaimAt: today,
    },
  });

  await progressMissionsForEvent(userId, "daily_claim", { reward });
  await writeEconomyEvent({
    userId,
    type: "daily_reward",
    amount: reward,
    currency: "COIN",
    meta: { streakDay: state.streakDay },
  });

  return {
    reward,
    coins: user.coins,
    streak: user.dailyStreak,
  };
}
