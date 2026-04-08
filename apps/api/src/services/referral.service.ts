import { prisma } from '../lib/prisma';
import { env } from '../lib/env';
import { createBotStartAppUrl } from '../lib/urls';
import { generateInviteReward, smartNotify } from './engagement.service';
import { progressMissionsForEvent } from './mission.service';
import { writeEconomyEvent } from './economyLedger.service';

const DEFAULT_REFERRAL_REWARD = 500;

// Phase 3 — Referral milestone kademeleri
export const REFERRAL_MILESTONES = [
  { count: 1,  reward: 'chest',        label: 'İlk Bağlantı',    description: '1 referral → Common Chest' },
  { count: 3,  reward: 'premium_badge', label: 'Ağ Kurucusu',    description: '3 referral → Premium Badge' },
  { count: 5,  reward: 'boost_slot',   label: 'Sinyal Yayıcı',   description: '5 referral → Boost Slot' },
  { count: 10, reward: 'elite_key',    label: 'Elite Operatör',  description: '10 referral → Elite Vault Key' },
  { count: 20, reward: 'season_title', label: 'Syndicate Lideri', description: '20 referral → Season Title' },
] as const;

export type ReferralMilestone = typeof REFERRAL_MILESTONES[number];

/** Aktif referral sayısına göre kazanılan milestone'ları döner */
export function getEarnedMilestones(activeReferrals: number): ReferralMilestone[] {
  return REFERRAL_MILESTONES.filter((m) => activeReferrals >= m.count);
}

/** Bir sonraki milestone'u döner */
export function getNextMilestone(activeReferrals: number): ReferralMilestone | null {
  return REFERRAL_MILESTONES.find((m) => activeReferrals < m.count) ?? null;
}

export async function ensureReferralEdgeForUser(
  inviteeUserId: string,
  referralCode: string,
  meta?: { ipHash?: string; deviceFingerprint?: string }
) {
  const invitee = await prisma.user.findUnique({
    where: { id: inviteeUserId },
    select: { id: true, referralCode: true, referredByCode: true, ipHash: true, deviceFingerprint: true }
  });

  if (!invitee || !referralCode || invitee.referralCode === referralCode) {
    return { created: false };
  }

  const referrer = await prisma.user.findUnique({
    where: { referralCode },
    select: { id: true, referralCode: true, ipHash: true, deviceFingerprint: true }
  });

  if (!referrer || referrer.id === inviteeUserId) {
    return { created: false };
  }

  // Aynı IP veya aynı cihaz kontrolü — fraud işaretle ama engelleme
  const sameIp = meta?.ipHash && referrer.ipHash && meta.ipHash === referrer.ipHash;
  const sameDevice = meta?.deviceFingerprint && referrer.deviceFingerprint && meta.deviceFingerprint === referrer.deviceFingerprint;
  const inviteeIpHash = meta?.ipHash || invitee.ipHash || null;
  const inviteeDeviceHash = meta?.deviceFingerprint || invitee.deviceFingerprint || null;

  return prisma.$transaction(async (tx) => {
    if (!invitee.referredByCode) {
      await tx.user.update({
        where: { id: inviteeUserId },
        data: { referredByCode: referralCode }
      });
    }

    const existing = await tx.referral.findUnique({ where: { inviteeUserId } });
    if (existing) return { created: false, referralId: existing.id };

    const created = await tx.referral.create({
      data: {
        referrerUserId: referrer.id,
        inviteeUserId,
        inviteeIpHash,
        inviteeDeviceHash,
        // Aynı IP/cihazdan geliyorsa direkt blocked
        status: (sameIp || sameDevice) ? 'blocked' : 'pending',
        rejectionReason: sameIp ? 'same_ip' : sameDevice ? 'same_device' : null
      }
    });

    return { created: true, referralId: created.id, blocked: !!(sameIp || sameDevice) };
  });
}

export async function approveReferralOnFirstPaid(userId: string) {
  return prisma.$transaction(async (tx) => {
    const edge = await tx.referral.findUnique({
      where: { inviteeUserId: userId }
    });

    if (!edge || edge.status !== 'pending') {
      return { rewarded: false };
    }

    const invitee = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { level: true }
    });
    const reward = Math.max(DEFAULT_REFERRAL_REWARD, generateInviteReward(invitee.level).reward);

    await tx.referral.update({
      where: { id: edge.id },
      data: {
        status: 'approved',
        rewardCoins: reward,
        approvedAt: new Date()
      }
    });

    await tx.user.update({
      where: { id: edge.referrerUserId },
      data: {
        coins: { increment: reward },
        totalLifetimeCoins: { increment: reward },
        eligibleRewardBalance: { increment: reward },
        referralRewardsGiven: { increment: reward }
      }
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        firstPaidAt: new Date()
      }
    });

    return { rewarded: true, coins: reward, referrerUserId: edge.referrerUserId, referralId: edge.id };
  }).then(async (result) => {
    if (!result.rewarded) return result;

    await Promise.all([
      writeEconomyEvent({
        userId: result.referrerUserId,
        type: 'referral_reward',
        amount: result.coins,
        reason: 'first_paid_referral',
        refType: 'referral',
        refId: result.referralId
      }),
      writeEconomyEvent({
        userId: result.referrerUserId,
        type: 'referral_reward_eligible',
        amount: result.coins,
        currency: 'eligibleRewardBalance',
        reason: 'first_paid_referral',
        refType: 'referral',
        refId: result.referralId
      }),
      progressMissionsForEvent(result.referrerUserId, 'referral', { amount: 1 })
    ]);

    return result;
  });
}

export async function getReferralOverview(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      referralCode: true,
      eligibleRewardBalance: true,
      dailyStreak: true,
      pendingPassiveIncome: true,
      level: true,
      referralsSent: {
        orderBy: { createdAt: 'desc' },
        include: {
          invitee: {
            select: {
              id: true,
              displayName: true,
              username: true,
              level: true,
              coins: true,
              dailyStreak: true
            }
          }
        }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const totals = {
    total: user.referralsSent.length,
    pending: user.referralsSent.filter((item) => item.status === 'pending').length,
    active: user.referralsSent.filter((item) => item.status === 'approved').length,
    rewarded: user.referralsSent.reduce((sum, item) => sum + item.rewardCoins, 0),
    blocked: user.referralsSent.filter((item) => item.status === 'blocked' || item.status === 'rejected').length,
    eligibleRewardBalance: user.eligibleRewardBalance
  };

  const previewReward = generateInviteReward(user.level).reward;

  return {
    code: user.referralCode,
    link: createBotStartAppUrl(env.BOT_USERNAME, user.referralCode),
    previewReward,
    activeOffer: totals.pending > 0 ? `Bir aktif davet daha ile +${previewReward} odul ac.` : null,
    smartNotification: smartNotify({
      dailyStreak: user.dailyStreak,
      pendingPassiveIncome: user.pendingPassiveIncome,
      referralCount: totals.total
    }),
    totals,
    milestones: {
      earned: getEarnedMilestones(totals.active),
      next: getNextMilestone(totals.active),
    },
    invites: user.referralsSent.map((item) => ({
      id: item.invitee.id,
      displayName: item.invitee.displayName,
      username: item.invitee.username,
      level: item.invitee.level,
      status: item.status,
      coins: item.invitee.coins,
      dailyStreak: item.invitee.dailyStreak
    }))
  };
}
