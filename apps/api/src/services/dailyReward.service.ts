import { prisma } from '../lib/prisma';
import { resolveGameplayState } from './economyRuntime.service';
import { progressMissionsForEvent } from './mission.service';
import { writeEconomyEvent } from './economyLedger.service';

const BASE_DAILY_REWARDS = [100, 140, 190, 260, 360, 500, 750];

function isSameUtcDay(left: Date, right: Date) {
  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  );
}

export async function getDailyState(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { ownedUpgrades: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const gameplay = resolveGameplayState(user, user.ownedUpgrades);
  const today = new Date();
  const lastClaimAt = user.lastDailyClaimAt;
  const alreadyClaimedToday = Boolean(lastClaimAt && isSameUtcDay(lastClaimAt, today));
  const gapHours = lastClaimAt ? (today.getTime() - lastClaimAt.getTime()) / 3600_000 : null;
  const streakBase = gapHours != null && gapHours > 48 ? 1 : Math.max(1, user.dailyStreak || 1);
  const streakDay = Math.min(streakBase, BASE_DAILY_REWARDS.length);
  const nextReward = Math.floor(BASE_DAILY_REWARDS[streakDay - 1] * gameplay.dailyRewardMultiplier);

  return {
    canClaim: !alreadyClaimedToday,
    streakDay,
    nextReward,
    multiplier: Number(gameplay.dailyRewardMultiplier.toFixed(2)),
    lastClaimAt
  };
}

export async function claimDailyReward(userId: string) {
  const state = await getDailyState(userId);
  if (!state.canClaim) {
    throw new Error('Daily reward already claimed');
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const reward = state.nextReward;
  const today = new Date();

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      coins: { increment: reward },
      xp: { increment: reward },
      totalLifetimeCoins: { increment: reward },
      dailyStreak: state.streakDay + 1,
      lastDailyClaimAt: today
    }
  });

  await progressMissionsForEvent(userId, 'daily_claim', { amount: 1, reward });
  await writeEconomyEvent({
    userId,
    type: 'daily_reward',
    amount: reward,
    reason: `daily_streak_${state.streakDay}`,
    meta: {
      streakDay: state.streakDay,
      previousClaimAt: user.lastDailyClaimAt?.toISOString() || null
    }
  });

  return {
    reward,
    coins: updated.coins,
    xp: updated.xp,
    streak: updated.dailyStreak
  };
}
