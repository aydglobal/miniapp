import { ADN_REFERRAL_QUESTS } from '../config/adnEconomy';
import { prisma } from '../lib/prisma';

function stageKey(chain: string, stage: number) {
  return `${chain.toLowerCase()}_stage_${stage}`;
}

function stageRewardType(stage: number) {
  return stage >= 4 ? 'eligible_reward_balance' : 'coins';
}

async function getReferralStageProgress(userId: string, stage: number) {
  const referrals = await prisma.referral.findMany({
    where: { referrerUserId: userId },
    include: {
      invitee: {
        select: {
          level: true,
          coins: true,
          dailyStreak: true,
          totalTaps: true,
          status: true
        }
      }
    }
  });

  if (stage === 1) return Math.min(1, referrals.length);
  if (stage === 2) return Math.min(1, referrals.filter((item) => item.invitee.level >= 3).length);
  if (stage === 3) return Math.min(100, referrals.reduce((sum, item) => sum + Math.min(100, item.invitee.coins), 0));
  if (stage === 4) return Math.min(2, referrals.filter((item) => item.invitee.level >= 4).length);
  if (stage === 5) return Math.min(1, referrals.filter((item) => item.invitee.dailyStreak >= 3).length);
  if (stage === 6) return Math.min(200, referrals.reduce((sum, item) => sum + Math.min(200, item.invitee.totalTaps), 0));
  return 0;
}

async function syncReferralQuestProgress(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { level: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const unlockedStages = ADN_REFERRAL_QUESTS.filter((stage) => stage.unlock_level <= user.level);

  for (const stage of unlockedStages) {
    const template = await prisma.referralQuestTemplate.upsert({
      where: { key: stageKey(stage.chain, stage.stage) },
      update: {
        title: stage.task,
        description: stage.requirement_detail,
        type: stage.chain.toLowerCase(),
        targetValue: stage.stage === 3 ? 100 : stage.stage === 4 ? 2 : stage.stage === 6 ? 200 : 1,
        rewardType: stageRewardType(stage.stage),
        rewardValue: stage.reward_adn,
        isActive: true
      },
      create: {
        key: stageKey(stage.chain, stage.stage),
        title: stage.task,
        description: stage.requirement_detail,
        type: stage.chain.toLowerCase(),
        targetValue: stage.stage === 3 ? 100 : stage.stage === 4 ? 2 : stage.stage === 6 ? 200 : 1,
        rewardType: stageRewardType(stage.stage),
        rewardValue: stage.reward_adn
      }
    });

    const progress = await getReferralStageProgress(userId, stage.stage);

    await prisma.referralQuestProgress.upsert({
      where: {
        userId_templateId: {
          userId,
          templateId: template.id
        }
      },
      update: {
        progress,
        completedAt: progress >= template.targetValue ? new Date() : null
      },
      create: {
        userId,
        templateId: template.id,
        progress,
        completedAt: progress >= template.targetValue ? new Date() : null
      }
    });

    await prisma.taskAssignment.upsert({
      where: {
        id: `${userId}_${template.id}`
      },
      update: {
        title: template.title,
        description: `${template.description}. Bonus: ${stage.bonus_reward}`,
        category: 'referral',
        source: 'growth_engine',
        payloadJson: JSON.stringify({
          antiAbuseRule: stage.anti_abuse_rule,
          completionCheck: stage.completion_check,
          nextTaskLogic: stage.next_task_logic
        }),
        isActive: true
      },
      create: {
        id: `${userId}_${template.id}`,
        userId,
        title: template.title,
        description: `${template.description}. Bonus: ${stage.bonus_reward}`,
        category: 'referral',
        source: 'growth_engine',
        payloadJson: JSON.stringify({
          antiAbuseRule: stage.anti_abuse_rule,
          completionCheck: stage.completion_check,
          nextTaskLogic: stage.next_task_logic
        })
      }
    });
  }
}

export async function ensureNextReferralTasks(userId: string, _segment?: string) {
  await syncReferralQuestProgress(userId);
  return prisma.taskAssignment.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'asc' }
  });
}

export async function listReferralQuestProgress(userId: string) {
  await syncReferralQuestProgress(userId);
  return prisma.referralQuestProgress.findMany({
    where: { userId },
    include: { template: true },
    orderBy: { assignedAt: 'asc' }
  });
}

export async function listReferralTasks(userId: string) {
  await syncReferralQuestProgress(userId);
  return prisma.taskAssignment.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'asc' }
  });
}
