import { prisma } from "../lib/prisma";
import { writeEconomyEvent } from "./economyLedger.service";

export async function getMissionBoard(userId: string) {
  const missions = await prisma.userMission.findMany({
    where: { userId, status: { in: ["active", "completed"] } },
    orderBy: { createdAt: "asc" },
  });

  return { missions };
}

export async function progressMissionsForEvent(
  userId: string,
  eventType: "tap" | "referral" | "daily_claim" | "purchase",
  payload: Record<string, unknown>,
) {
  const missions = await prisma.userMission.findMany({
    where: { userId, status: "active", eventType },
  });

  for (const mission of missions) {
    const nextProgress = Math.min(mission.targetValue, mission.progress + 1);
    const nextStatus = nextProgress >= mission.targetValue ? "completed" : "active";

    await prisma.userMission.update({
      where: { id: mission.id },
      data: {
        progress: nextProgress,
        status: nextStatus,
        completedAt: nextStatus === "completed" ? new Date() : null,
      },
    });
  }

  return { updated: missions.length, payload };
}

export async function claimMissionReward(userId: string, missionId: string) {
  const mission = await prisma.userMission.findFirst({
    where: { id: missionId, userId },
  });
  if (!mission) throw new Error("Mission not found");
  if (mission.status !== "completed") throw new Error("Mission is not completed");
  if (mission.rewardClaimedAt) throw new Error("Reward already claimed");

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { coins: { increment: mission.rewardCoins } },
  });

  await prisma.userMission.update({
    where: { id: mission.id },
    data: { rewardClaimedAt: new Date(), status: "claimed" },
  });

  await writeEconomyEvent({
    userId,
    type: "mission_reward",
    amount: mission.rewardCoins,
    currency: "COIN",
    meta: { missionId: mission.id },
  });

  return {
    claimed: mission.rewardCoins,
    coins: updatedUser.coins,
  };
}
