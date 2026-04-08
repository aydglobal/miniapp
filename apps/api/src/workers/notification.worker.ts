import { prisma } from '../lib/prisma';
import { canSendNotification, markNotificationSent, queueNotification, type NotificationTrigger } from '../services/notification.service';

async function sendTelegramMessage(userId: string, text: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return false;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { telegramId: true } });
  if (!user?.telegramId || user.telegramId.startsWith('preview_')) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: user.telegramId, text, parse_mode: 'HTML' })
    });
    const data = await res.json() as { ok: boolean };
    return data.ok;
  } catch {
    return false;
  }
}

function computeEngagementSegment(params: {
  lastSeenAt: Date | null;
  sessions7d: number;
  taps7d: number;
}) {
  const daysGone = params.lastSeenAt
    ? (Date.now() - params.lastSeenAt.getTime()) / 86400000
    : 999;

  if (daysGone >= 7) return { segment: 'cold', churnRisk: 0.9 };
  if (daysGone >= 3) return { segment: 'warm', churnRisk: 0.6 };
  if (params.sessions7d >= 5 && params.taps7d >= 200) return { segment: 'hot', churnRisk: 0.1 };
  return { segment: 'warm', churnRisk: 0.3 };
}

function inferTrigger(user: {
  lastSeenAt: Date | null;
  lastDailyClaimAt: Date | null;
}): NotificationTrigger {
  const daysGone = user.lastSeenAt
    ? (Date.now() - user.lastSeenAt.getTime()) / 86400000
    : 999;

  if (daysGone >= 3) return 'churn_risk';

  const lastClaim = user.lastDailyClaimAt?.getTime() || 0;
  const hoursSinceClaim = (Date.now() - lastClaim) / 3600000;
  if (hoursSinceClaim >= 20) return 'daily_ready';

  return 'mission_ready';
}

export async function runNotificationWorker() {
  const users = await prisma.user.findMany({
    where: {
      isBanned: false,
      telegramId: { not: { startsWith: 'preview_' } }
    },
    select: {
      id: true,
      username: true,
      lastSeenAt: true,
      lastDailyClaimAt: true,
      engagementScore: true
    },
    take: 100,
    orderBy: { updatedAt: 'asc' } // FIFO — en eski güncellenenler önce
  });

  let processed = 0;

  for (const user of users) {
    const score = user.engagementScore;
    const { segment, churnRisk } = computeEngagementSegment({
      lastSeenAt: user.lastSeenAt,
      sessions7d: score?.sessions7d || 0,
      taps7d: score?.taps7d || 0
    });

    await prisma.userEngagementScore.upsert({
      where: { userId: user.id },
      update: { segment, churnRisk },
      create: { userId: user.id, segment, churnRisk }
    });

    const trigger = inferTrigger(user);
    const allowed = await canSendNotification({
      userId: user.id,
      type: trigger,
      cooldownHours: 12
    });

    if (!allowed) continue;

    const log = await queueNotification({
      userId: user.id,
      type: trigger,
      username: user.username,
      segment,
      metadata: { churnRisk }
    });

    const sent = await sendTelegramMessage(user.id, log.messageText);
    if (sent) {
      await markNotificationSent(log.id);
      processed += 1;
    }
  }

  return { processed };
}
