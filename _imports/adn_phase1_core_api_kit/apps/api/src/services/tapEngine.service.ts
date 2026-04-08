import { prisma } from "../lib/prisma";
import { assertTapAllowed, registerTapSignal } from "./antiCheat.service";
import { writeEconomyEvent } from "./economyLedger.service";
import { progressMissionsForEvent } from "./mission.service";
import { syncLevelState } from "./level.service";

type PerformTapOptions = {
  nonce?: string;
};

export async function performTap(userId: string, options: PerformTapOptions = {}) {
  await assertTapAllowed(userId, options);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (user.energy <= 0) throw new Error("Not enough energy");

  const reward = user.tapReward;
  const xpGain = user.tapXpReward;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      coins: { increment: reward },
      energy: { decrement: 1 },
      xp: { increment: xpGain },
      totalTaps: { increment: 1 },
      lastSeenAt: new Date(),
    },
  });

  await registerTapSignal(userId);
  await writeEconomyEvent({
    userId,
    type: "tap_reward",
    amount: reward,
    currency: "COIN",
    meta: { xpGain, nonce: options.nonce ?? null },
  });

  await progressMissionsForEvent(userId, "tap", { amount: 1, coinsEarned: reward });
  const levelState = await syncLevelState(userId);

  return {
    coins: updated.coins,
    energy: updated.energy,
    reward,
    xpGain,
    level: levelState.level,
    unlocks: levelState.unlocks,
  };
}
