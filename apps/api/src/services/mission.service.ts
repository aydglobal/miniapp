import { prisma } from '../lib/prisma';
import { getMissionTemplate } from '../config/adnEconomy';
import { resolveGameplayState, resolvePlayerSegment } from './economyRuntime.service';
import { writeEconomyEvent } from './economyLedger.service';
import { markTutorialStep } from './onboarding.service';
import { buildDynamicReferralTask } from './aiTask.service';

type MissionBlueprint = {
  key: string;
  title: string;
  description: string;
  category: string;
  eventType: string;
  targetValue: number;
  rewardCoins: number;
  rewardXp: number;
};

function buildMissionBlueprints(params: {
  level: number;
  segment: string;
  missionRewardMultiplier: number;
}) {
  const template = getMissionTemplate(params.segment);
  const rewardScale = params.missionRewardMultiplier;
  const tapTarget = Math.max(20, 20 + params.level * 4);

  const missions: MissionBlueprint[] = [
    {
      key: `tap_loop_l${params.level}`,
      title: 'Momentum hattini kur',
      description: template.recommended_next_quest,
      category: template.player_segment,
      eventType: 'tap',
      targetValue: tapTarget,
      rewardCoins: Math.floor((140 + params.level * 24) * rewardScale),
      rewardXp: Math.floor((90 + params.level * 12) * rewardScale)
    },
    {
      key: `daily_flow_l${params.level}`,
      title: 'Gunluk akisi yakala',
      description: `${template.reason}. Gunluk odulu al ve seriyi koru.`,
      category: 'retention',
      eventType: 'daily_claim',
      targetValue: 1,
      rewardCoins: Math.floor((120 + params.level * 20) * rewardScale),
      rewardXp: Math.floor((80 + params.level * 10) * rewardScale)
    },
    {
      key: `shop_move_l${params.level}`,
      title: 'Bir modulu buyut',
      description: 'Pazardan bir modul satin al veya seviye atlat.',
      category: 'economy',
      eventType: 'purchase',
      targetValue: 1,
      rewardCoins: Math.floor((180 + params.level * 28) * rewardScale),
      rewardXp: Math.floor((100 + params.level * 15) * rewardScale)
    }
  ];

  if (params.level >= 8) {
    // aiTask servisi ile dinamik referral görevi oluştur
    const dynamicTask = buildDynamicReferralTask({
      segment: params.segment as 'cold' | 'warm' | 'hot' | 'whale',
      likesReferral: params.segment === 'Referral-focused',
      dropsOnHardTasks: params.segment === 'New user',
      purchasedBefore: params.segment === 'Whale' || params.segment === 'Mid spender'
    });

    missions.push({
      key: `referral_push_l${params.level}`,
      title: dynamicTask.title,
      description: dynamicTask.description,
      category: dynamicTask.category,
      eventType: 'referral',
      targetValue: 1,
      rewardCoins: Math.floor((220 + params.level * 32) * rewardScale),
      rewardXp: Math.floor((120 + params.level * 18) * rewardScale)
    });
  }

  return missions;
}

export async function ensureMissionBoard(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedUpgrades: true,
      payments: {
        where: { status: 'paid' },
        select: { id: true }
      },
      referralsSent: {
        select: { id: true }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const gameplay = resolveGameplayState(user, user.ownedUpgrades);
  const segment = resolvePlayerSegment({
    level: gameplay.level,
    suspiciousScore: user.suspiciousScore,
    paymentsCount: user.payments.length,
    referralCount: user.referralsSent.length,
    totalTaps: user.totalTaps,
    lastSeenAt: user.lastSeenAt,
    pendingPassiveIncome: user.pendingPassiveIncome
  });
  const desired = buildMissionBlueprints({
    level: gameplay.level,
    segment,
    missionRewardMultiplier: gameplay.missionRewardMultiplier
  });

  const existing = await prisma.userMission.findMany({
    where: {
      userId,
      status: { in: ['active', 'completed'] }
    }
  });
  const existingKeys = new Set(existing.map((item) => item.key));

  await Promise.all(
    desired
      .filter((mission) => !existingKeys.has(mission.key))
      .map((mission) =>
        prisma.userMission.create({
          data: {
            userId,
            key: mission.key,
            title: mission.title,
            description: mission.description,
            category: mission.category,
            eventType: mission.eventType,
            targetValue: mission.targetValue,
            rewardCoins: mission.rewardCoins,
            rewardXp: mission.rewardXp
          }
        })
      )
  );

  return {
    segment,
    recommendation: getMissionTemplate(segment),
    missions: await prisma.userMission.findMany({
      where: { userId, status: { in: ['active', 'completed', 'claimed'] } },
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }]
    })
  };
}

export async function getMissionBoard(userId: string) {
  return ensureMissionBoard(userId);
}

export async function progressMissionsForEvent(
  userId: string,
  eventType: 'tap' | 'referral' | 'daily_claim' | 'purchase',
  payload: Record<string, unknown>
) {
  const missions = await prisma.userMission.findMany({
    where: { userId, status: 'active', eventType }
  });

  if (!missions.length) {
    return { updated: 0, payload };
  }

  const amount = Math.max(1, Number(payload.amount || payload.taps || 1));

  for (const mission of missions) {
    const nextProgress = Math.min(mission.targetValue, mission.progress + amount);
    const nextStatus = nextProgress >= mission.targetValue ? 'completed' : 'active';

    await prisma.userMission.update({
      where: { id: mission.id },
      data: {
        progress: nextProgress,
        status: nextStatus,
        completedAt: nextStatus === 'completed' ? new Date() : null
      }
    });
  }

  return { updated: missions.length, payload };
}

export async function claimMissionReward(userId: string, missionId: string) {
  const mission = await prisma.userMission.findFirst({
    where: { id: missionId, userId }
  });

  if (!mission) {
    throw new Error('Mission not found');
  }

  if (mission.status !== 'completed') {
    throw new Error('Mission is not completed');
  }

  if (mission.rewardClaimedAt) {
    throw new Error('Mission reward already claimed');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      coins: { increment: mission.rewardCoins },
      xp: { increment: mission.rewardXp || mission.rewardCoins },
      totalLifetimeCoins: { increment: mission.rewardCoins }
    }
  });

  await prisma.userMission.update({
    where: { id: mission.id },
    data: {
      rewardClaimedAt: new Date(),
      status: 'claimed'
    }
  });

  await writeEconomyEvent({
    userId,
    type: 'mission_reward',
    amount: mission.rewardCoins,
    reason: mission.title,
    refType: 'mission',
    refId: mission.id,
    meta: {
      rewardXp: mission.rewardXp,
      category: mission.category
    }
  });
  await markTutorialStep({ userId, step: 'firstMissionDone' }).catch(() => null);

  return {
    claimed: mission.rewardCoins,
    xp: mission.rewardXp,
    coins: updatedUser.coins
  };
}
