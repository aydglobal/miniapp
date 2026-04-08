import { prisma } from '../lib/prisma';
import { env } from '../lib/env';
import { AntiCheatError, assertTapAllowed, generateTapNonce } from '../lib/antiCheat';
import { getActiveBoostMap, getEffectiveEnergyMax } from '../lib/boosts';
import { restoreEnergy } from '../lib/energy';
import { assignPricingVariant } from '../lib/experimentPricing';
import { createBotStartAppUrl } from '../lib/urls';
import { claimPassiveIncome } from './income.service';
import { progressMissionsForEvent } from './mission.service';
import { markTutorialStep } from './onboarding.service';
import { getProfile } from './profile.service';
import { ensureReferralEdgeForUser, getReferralOverview } from './referral.service';
import { resolveGameplayState } from './economyRuntime.service';
import { recordClanContribution } from './clan.service';
import {
  calculateComboMultiplier,
  calculateCritChance,
  calculatePrestigeBonus,
  calculateTapReward,
  maybeDropChest
} from './engagement.service';
import { evaluateRiskSignals, applyRiskOutcome } from './advancedAntiCheat.service';
import { getActiveTapMultiplier, getActiveChestLuckMultiplier } from './liveOpsAdmin.service';

const DEFAULT_TASKS = [
  {
    code: 'tap_25',
    title: 'Ilk akisi baslat',
    description: 'Lion ile 25 kez uretim yap ve ritmi ac.',
    rewardCoins: 300
  },
  {
    code: 'claim_daily',
    title: 'Gunluk akisi topla',
    description: 'Gunluk akisini bir kez toplayarak seriyi baslat.',
    rewardCoins: 450
  },
  {
    code: 'buy_first_card',
    title: 'Ilk modulunu kur',
    description: 'Pazardan ilk modulunu devreye al ve saatlik akisi ac.',
    rewardCoins: 900
  },
  {
    code: 'invite_friend',
    title: 'Agina bir operatif bagla',
    description: 'Bir daveti aktif hale getir ve network zincirini baslat.',
    rewardCoins: 1200
  },
  // Sosyal görevler
  {
    code: 'join_telegram',
    title: 'Telegram kanalına katıl',
    description: 'ADN Token Telegram kanalına katıl ve topluluğa dahil ol.',
    rewardCoins: 500
  },
  {
    code: 'start_bot',
    title: 'Telegram botu başlat',
    description: 'ADN Token botunu başlat.',
    rewardCoins: 300
  },
  {
    code: 'follow_x',
    title: 'X hesabını takip et',
    description: 'ADN Token X (Twitter) hesabını takip et.',
    rewardCoins: 400
  },
  {
    code: 'sub_youtube',
    title: 'YouTube kanalına abone ol',
    description: 'ADN Token YouTube kanalına abone ol.',
    rewardCoins: 350
  },
  {
    code: 'follow_instagram',
    title: 'Instagram hesabını takip et',
    description: 'ADN Token Instagram hesabını takip et.',
    rewardCoins: 300
  }
] as const;

const TASK_ORDER = DEFAULT_TASKS.map((task) => task.code);
const TASK_ORDER_INDEX = new Map(TASK_ORDER.map((code, index) => [code, index]));

const MINIMUM_CLAIM_POINTS = 2000;
const REFERRAL_REWARD_POINTS = 250;
const POINTS_TO_TOKEN_RATIO = 20;

export async function getOrCreateUserByTelegram(params: {
  telegramId: string;
  displayName: string;
  username?: string;
  referralCode?: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { telegramId: params.telegramId }
  });

  if (existing) {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        displayName: params.displayName,
        username: params.username,
        isAdmin: normalizeUsername(params.username) === normalizeUsername(env.ADMIN_TELEGRAM_USERNAME)
      }
    });

    if (!updated.referredByCode && params.referralCode) {
      await ensureReferralEdgeForUser(updated.id, params.referralCode).catch(() => null);
    }

    return updated;
  }

  const created = await prisma.user.create({
    data: {
      telegramId: params.telegramId,
      displayName: params.displayName,
      username: params.username,
      pricingVariant: assignPricingVariant(params.telegramId),
      isAdmin: normalizeUsername(params.username) === normalizeUsername(env.ADMIN_TELEGRAM_USERNAME),
      passiveIncomePerHour: 120,
      lastTapAt: new Date(),
      referralCode: cryptoRandomCode(),
      referredByCode: params.referralCode,
      lastPassiveIncomeAt: new Date()
    }
  });

  if (params.referralCode) {
    await ensureReferralEdgeForUser(created.id, params.referralCode).catch(() => null);
  }

  return created;
}

export async function collectMiningIncome(userId: string) {
  const claimed = await claimPassiveIncome(userId);
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      boosts: true,
      ownedUpgrades: true
    }
  });

  const boostState = getActiveBoostMap(
    user.boosts.map((boost) => ({
      type: boost.type,
      level: boost.level,
      isActive: boost.isActive,
      expiresAt: boost.expiresAt
    }))
  );
  const gameplay = resolveGameplayState(user, user.ownedUpgrades);
  const effectiveEnergyMax = getEffectiveEnergyMax(gameplay.maxEnergy, boostState.energyMaxBonus);
  const restored = restoreEnergy({
    currentEnergy: user.energy,
    lastEnergyAt: user.lastEnergyAt,
    energyMax: effectiveEnergyMax,
    regenPerMinute: gameplay.regenPerMinute * boostState.regenMultiplier
  });

  if (restored.energy !== user.energy || effectiveEnergyMax !== user.maxEnergy || user.level !== gameplay.level) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        energy: restored.energy,
        lastEnergyAt: restored.lastEnergyAt,
        maxEnergy: gameplay.maxEnergy,
        level: gameplay.level,
        offlineCapHours: gameplay.offlineCapHours
      }
    });
  }

  return {
    coins: claimed.coins,
    energy: restored.energy,
    energyMax: effectiveEnergyMax,
    addedCoins: claimed.claimed,
    level: gameplay.level,
    tapMultiplier: boostState.tapMultiplier,
    tapNonce: user.tapNonce,
    passiveIncomePerHour: gameplay.passiveIncomePerHour,
    pendingMiningCoins: 0
  };
}

export async function tapUser(userId: string, taps = 1, clientNonce?: number) {
  let capturedWindowCount = 0;

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        boosts: true,
        ownedUpgrades: true
      }
    });

    const antiCheat = assertTapAllowed(user, { count: taps, clientNonce });
    const totalCost = antiCheat.tapCount;
    capturedWindowCount = antiCheat.nextWindowCount;
    const boostState = getActiveBoostMap(
      user.boosts.map((boost) => ({
        type: boost.type,
        level: boost.level,
        isActive: boost.isActive,
        expiresAt: boost.expiresAt
      }))
    );
    const gameplay = resolveGameplayState(user, user.ownedUpgrades);
    const effectiveEnergyMax = getEffectiveEnergyMax(gameplay.maxEnergy, boostState.energyMaxBonus);

    // Tap öncesi birikmiş enerjiyi restore et
    const regenPerMinute = gameplay.regenPerMinute ?? 1;
    const { energy: restoredEnergy } = restoreEnergy({
      currentEnergy: user.energy,
      lastEnergyAt: user.lastEnergyAt ?? new Date(),
      energyMax: effectiveEnergyMax,
      regenPerMinute
    });
    const currentEnergy = Math.min(restoredEnergy, effectiveEnergyMax);

    if (currentEnergy < totalCost) {
      return {
        coins: user.coins,
        energy: currentEnergy,
        energyMax: effectiveEnergyMax,
        addedCoins: 0,
        level: gameplay.level,
        tapMultiplier: boostState.tapMultiplier,
        tapNonce: user.tapNonce,
        passiveIncomePerHour: gameplay.passiveIncomePerHour,
        pendingMiningCoins: user.pendingPassiveIncome
      };
    }

    const prestigeBonus = calculatePrestigeBonus(gameplay.level);
    const comboMultiplier = calculateComboMultiplier(antiCheat.nextWindowCount);
    const rewardResult = calculateTapReward(gameplay.tapReward * antiCheat.tapCount, {
      prestigeBonus,
      critChance: calculateCritChance(gameplay.level),
      comboMultiplier
    });
    const baseTapReward = Math.max(1, rewardResult.reward);
    const eventTapMultiplier = await getActiveTapMultiplier();
    const eventChestMultiplier = await getActiveChestLuckMultiplier();
    const chest = maybeDropChest(gameplay.level, baseTapReward * eventChestMultiplier);
    const addedCoins = Math.max(1, Math.floor(baseTapReward * boostState.tapMultiplier * eventTapMultiplier));
    const nextCoins = user.coins + addedCoins;
    const nextXp = user.xp + addedCoins;
    const nextEnergy = currentEnergy - totalCost;
    const nextGameplay = resolveGameplayState(
      {
        coins: nextCoins,
        xp: nextXp,
        passiveIncomePerHour: user.passiveIncomePerHour,
        offlineCapHours: user.offlineCapHours
      },
      user.ownedUpgrades
    );

    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        coins: nextCoins,
        xp: nextXp,
        totalLifetimeCoins: { increment: addedCoins },
        energy: nextEnergy,
        level: nextGameplay.level,
        maxEnergy: nextGameplay.maxEnergy,
        offlineCapHours: nextGameplay.offlineCapHours,
        // lastEnergyAt'i sıfırlama — enerji regen birikmeye devam etsin
        tapNonce: generateTapNonce(),
        lastTapAt: new Date(),
        totalTaps: { increment: antiCheat.tapCount },
        tapWindowStart: antiCheat.resetWindow ? new Date() : user.tapWindowStart || new Date(),
        tapsInWindow: antiCheat.nextWindowCount
      }
    });

    await tx.walletLedgerEntry.create({
      data: {
        userId,
        entryType: 'tap_reward',
        bucket: 'coins',
        amount: addedCoins,
        balanceBefore: user.coins,
        balanceAfter: updated.coins,
        reason: 'tap_reward',
        metadataJson: JSON.stringify({
          taps: antiCheat.tapCount,
          tapReward: gameplay.tapReward,
          tapMultiplier: boostState.tapMultiplier,
          prestigeBonus,
          comboMultiplier,
          criticalHit: rewardResult.criticalHit,
          chest
        })
      }
    });

    if (chest) {
      await tx.userChest.create({
        data: {
          userId,
          source: 'tap',
          rarity: chest.tier,
          rewardCoins: chest.rewardCoins,
          shards: chest.shards || 0,
          boostMinutes: chest.boostMinutes || 0
        }
      });
    }

    return {
      coins: updated.coins,
      energy: updated.energy,
      energyMax: effectiveEnergyMax,
      addedCoins,
      level: updated.level,
      tapMultiplier: boostState.tapMultiplier,
      tapNonce: updated.tapNonce,
      passiveIncomePerHour: nextGameplay.passiveIncomePerHour,
      pendingMiningCoins: updated.pendingPassiveIncome,
      criticalHit: rewardResult.criticalHit,
      critMultiplier: rewardResult.critMultiplier,
      prestigeBonus,
      comboMultiplier,
      chest,
      note: chest
        ? `${chest.tier} sandik dustu. Chest vault ekranindan acabilirsin.`
        : rewardResult.criticalHit
          ? 'Kritik vurus! Tap odulu katlandi.'
          : null
    };
  return result;
}).then(async (txResult: {
    coins: number; energy: number; energyMax: number; addedCoins: number;
    level: number; tapMultiplier: number; tapNonce: number; passiveIncomePerHour: number;
    pendingMiningCoins: number; criticalHit?: boolean; critMultiplier?: number;
    prestigeBonus?: number; comboMultiplier?: number;
    chest?: { tier: string; rewardCoins: number; shards: number; boostMinutes: number; jackpot?: boolean; dropped: true } | null;
    note?: string | null;
  }) => {
    // Post-tap işlemleri — response'u bekletme, arka planda çalışsın
    Promise.all([
      progressMissionsForEvent(userId, 'tap', {
        amount: Math.max(1, taps),
        coinsEarned: txResult.addedCoins,
        criticalHit: txResult.criticalHit,
        chestTier: txResult.chest?.tier || null
      }),
      recordClanContribution(userId, txResult.addedCoins),
      markTutorialStep({ userId, step: 'firstTapDone' }).catch(() => null)
    ]).catch(() => null);

    // Advanced anti-cheat: arka planda risk sinyallerini değerlendir
    evaluateRiskSignals({
      userId,
      ipHash: null,
      deviceFingerprint: null,
      tapsPerMinute: (capturedWindowCount / 10) * 6
    }).then(({ risk, signals }) => {
      if (risk > 0) applyRiskOutcome(userId, risk, signals).catch(() => null);
    }).catch(() => null);

    return txResult;
  });
}

export async function refillEnergy(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { ownedUpgrades: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const gameplay = resolveGameplayState(user, user.ownedUpgrades);

  return prisma.user.update({
    where: { id: userId },
    data: { energy: gameplay.maxEnergy }
  });
}

export async function getAirdropDashboard(userId: string) {
  await ensureDefaultTasks();
  const user = await getProfile(userId);
  const referralOverview = await getReferralOverview(userId);

  const [tasks, progresses] = await Promise.all([
    prisma.task.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' }
    }),
    prisma.taskProgress.findMany({
      where: { userId },
      select: {
        taskId: true,
        completed: true,
        claimed: true
      }
    })
  ]);

  const progressMap = new Map(progresses.map((progress) => [progress.taskId, progress]));
  const mappedTasks = tasks
    .map((task) => {
      const progress = progressMap.get(task.id);
      const completed = evaluateTaskCompletion(task.code, {
        totalTaps: user.totalTaps,
        dailyStreak: user.dailyStreak || 0,
        referralCount: referralOverview.totals.active,
        ownedUpgradeCount: user.ownedUpgradeCount || 0
      });

      return {
        id: task.id,
        code: task.code,
        title: task.title,
        description: task.description,
        rewardPoints: task.rewardCoins,
        completed,
        claimed: Boolean(progress?.claimed)
      };
    })
    .sort(
      (left, right) =>
        (TASK_ORDER_INDEX.get(left.code as (typeof TASK_ORDER)[number]) ?? Number.MAX_SAFE_INTEGER) -
        (TASK_ORDER_INDEX.get(right.code as (typeof TASK_ORDER)[number]) ?? Number.MAX_SAFE_INTEGER)
    );

  const referralPoints = referralOverview.totals.rewarded * REFERRAL_REWARD_POINTS;
  const totalPoints = user.coins + referralPoints;
  const completedTasks = mappedTasks.filter((task) => task.completed).length;

  return {
    user,
    tasks: mappedTasks,
    referralLink: createReferralLink(user.referralCode),
    summary: {
      totalPoints,
      referralCount: referralOverview.totals.active,
      referralPoints,
      estimatedTokens: estimateTokens(totalPoints),
      completedTasks,
      claimable: totalPoints >= MINIMUM_CLAIM_POINTS && completedTasks >= 3,
      minimumPoints: MINIMUM_CLAIM_POINTS
    }
  };
}

export async function completeAirdropTask(userId: string, taskCode: string) {
  await ensureDefaultTasks();

  const user = await getProfile(userId);
  const referralOverview = await getReferralOverview(userId);

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findUniqueOrThrow({
      where: { code: taskCode }
    });

    const completed = evaluateTaskCompletion(task.code, {
      totalTaps: user.totalTaps,
      dailyStreak: user.dailyStreak || 0,
      referralCount: referralOverview.totals.active,
      ownedUpgradeCount: user.ownedUpgradeCount || 0
    });

    if (!completed) {
      throw new Error('Bu gorev henuz tamamlanmadi.');
    }

    const existing = await tx.taskProgress.findUnique({
      where: {
        userId_taskId: {
          userId,
          taskId: task.id
        }
      }
    });

    if (existing?.claimed) {
      return { alreadyClaimed: true };
    }

    if (!existing) {
      await tx.taskProgress.create({
        data: {
          userId,
          taskId: task.id,
          completed: true,
          claimed: true
        }
      });
    } else {
      await tx.taskProgress.update({
        where: {
          userId_taskId: {
            userId,
            taskId: task.id
          }
        },
        data: {
          completed: true,
          claimed: true
        }
      });
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        coins: { increment: task.rewardCoins },
        xp: { increment: task.rewardCoins },
        totalLifetimeCoins: { increment: task.rewardCoins }
      }
    });

    return { alreadyClaimed: false };
  });
}

export async function submitClaimRequest(userId: string, walletAddress: string) {
  const dashboard = await getAirdropDashboard(userId);

  if (!dashboard.summary.claimable) {
    throw new Error(`Claim icin en az ${MINIMUM_CLAIM_POINTS} puan ve 3 tamamlanmis gorev gerekiyor.`);
  }

  return {
    walletAddress,
    estimatedTokens: dashboard.summary.estimatedTokens,
    status: 'queued' as const,
    message: 'Claim talebin siraya alindi. Snapshot sonrasi dagitim duyurulacak.'
  };
}

export function getMiningState(params: {
  coins: number;
  passiveIncomePerHour: number;
  level: number;
  lastCollectedAt: Date;
  offlineCapHours?: number;
}) {
  const now = Date.now();
  const capMinutes = Math.floor((params.offlineCapHours || 12) * 60);
  const elapsedMinutes = Math.max(
    0,
    Math.min(
      capMinutes,
      Math.floor((now - new Date(params.lastCollectedAt).getTime()) / 60000)
    )
  );
  const pendingCoins = Math.max(0, Math.floor((params.passiveIncomePerHour / 60) * elapsedMinutes));

  return {
    elapsedMinutes,
    pendingCoins
  };
}

async function ensureDefaultTasks() {
  await Promise.all(
    DEFAULT_TASKS.map((task) =>
      prisma.task.upsert({
        where: { code: task.code },
        update: {
          title: task.title,
          description: task.description,
          rewardCoins: task.rewardCoins,
          isActive: true
        },
        create: task
      })
    )
  );
}

function evaluateTaskCompletion(
  code: string,
  state: {
    totalTaps: number;
    dailyStreak: number;
    referralCount: number;
    ownedUpgradeCount: number;
  }
) {
  if (code === 'tap_25') return state.totalTaps >= 25;
  if (code === 'claim_daily') return state.dailyStreak >= 1;
  if (code === 'buy_first_card') return state.ownedUpgradeCount >= 1;
  if (code === 'invite_friend') return state.referralCount >= 1;
  // Sosyal görevler — kullanıcı claim ettiğinde tamamlanmış sayılır
  if (['join_telegram', 'start_bot', 'follow_x', 'sub_youtube', 'follow_instagram'].includes(code)) return true;
  return false;
}

function cryptoRandomCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function estimateTokens(totalPoints: number) {
  return Math.floor(totalPoints / POINTS_TO_TOKEN_RATIO);
}

function createReferralLink(referralCode: string) {
  return createBotStartAppUrl(env.BOT_USERNAME, referralCode);
}

function normalizeUsername(value?: string | null) {
  return String(value || '').replace(/^@/, '').toLowerCase();
}
