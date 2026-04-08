import { prisma } from "../lib/prisma";
import { buildNudge, TriggerType } from "../lib/notificationTemplates";

export async function canSendNotification(input: {
  userId: string;
  type: TriggerType;
  cooldownHours?: number;
}) {
  const cooldownHours = input.cooldownHours ?? 12;
  const threshold = new Date(Date.now() - cooldownHours * 60 * 60 * 1000);

  const last = await prisma.notificationLog.findFirst({
    where: {
      userId: input.userId,
      type: input.type,
      createdAt: { gt: threshold },
    },
    orderBy: { createdAt: "desc" },
  });

  return !last;
}

export async function queueNotification(input: {
  userId: string;
  type: TriggerType;
  username?: string | null;
  segment?: string;
  campaignKey?: string;
  metadata?: Record<string, any>;
}) {
  const text = buildNudge({
    username: input.username,
    segment: input.segment || "warm",
    trigger: input.type,
  });

  return prisma.notificationLog.create({
    data: {
      userId: input.userId,
      type: input.type,
      campaignKey: input.campaignKey,
      messageText: text,
      status: "queued",
      metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });
}

export async function markNotificationSent(id: string) {
  return prisma.notificationLog.update({
    where: { id },
    data: {
      status: "sent",
      sentAt: new Date(),
    },
  });
}

export async function getAdminNotificationSummary() {
  const [queued, sentToday] = await Promise.all([
    prisma.notificationLog.count({ where: { status: "queued" } }),
    prisma.notificationLog.count({
      where: {
        status: "sent",
        sentAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return { queued, sentToday };
}
