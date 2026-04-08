import { prisma } from "../lib/prisma";
import { computeEngagement } from "../lib/engagement";
import { canSendNotification, queueNotification, markNotificationSent } from "../services/notification.service";

async function fakeSendToTelegram(userId: string, text: string) {
  // Buraya gerçek Telegram Bot API sendMessage entegrasyonu eklenecek
  console.log("SEND_NOTIFICATION", { userId, text });
  return true;
}

function inferTrigger(user: any): "churn_risk" | "daily_ready" | "mission_ready" {
  const lastSeenMs = user.lastSeenAt ? new Date(user.lastSeenAt).getTime() : 0;
  const daysGone = lastSeenMs ? (Date.now() - lastSeenMs) / 86400000 : 999;
  if (daysGone >= 3) return "churn_risk";
  if (user.dailyReady) return "daily_ready";
  return "mission_ready";
}

export async function runNotificationWorker() {
  const users = await prisma.user.findMany({
    where: { isBanned: false },
    take: 100,
    orderBy: { updatedAt: "desc" },
  } as any);

  let processed = 0;

  for (const user of users as any[]) {
    const existingScore = await prisma.userEngagementScore.findUnique({
      where: { userId: user.id },
    });

    const engagement = computeEngagement({
      lastSeenAt: user.lastSeenAt || null,
      sessions7d: existingScore?.sessions7d || 0,
      taps7d: existingScore?.taps7d || 0,
      purchases30d: existingScore?.purchases30d || 0,
      referrals30d: existingScore?.referrals30d || 0,
    });

    await prisma.userEngagementScore.upsert({
      where: { userId: user.id },
      update: {
        engagementScore: engagement.engagementScore,
        churnRisk: engagement.churnRisk,
        segment: engagement.segment,
      },
      create: {
        userId: user.id,
        engagementScore: engagement.engagementScore,
        churnRisk: engagement.churnRisk,
        segment: engagement.segment,
      },
    });

    const trigger = inferTrigger(user);
    const allowed = await canSendNotification({
      userId: user.id,
      type: trigger,
      cooldownHours: 12,
    });

    if (!allowed) continue;

    const log = await queueNotification({
      userId: user.id,
      type: trigger,
      username: user.username,
      segment: engagement.segment,
      metadata: { churnRisk: engagement.churnRisk },
    });

    await fakeSendToTelegram(user.id, log.messageText);
    await markNotificationSent(log.id);
    processed += 1;
  }

  return { processed };
}
