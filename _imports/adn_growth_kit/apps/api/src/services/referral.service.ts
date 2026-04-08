import { prisma } from "../lib/prisma";
import { computeReferralQuality, isReferralQualified, isSelfReferral } from "../lib/referralRules";

function generateCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function getOrCreateReferralCode(userId: string) {
  const existing = await prisma.referralCode.findUnique({ where: { userId } });
  if (existing) return existing;

  let code = generateCode();
  while (await prisma.referralCode.findUnique({ where: { code } })) {
    code = generateCode();
  }

  return prisma.referralCode.create({
    data: { userId, code },
  });
}

export async function applyReferralCode(input: {
  invitedUserId: string;
  code: string;
}) {
  const codeRow = await prisma.referralCode.findUnique({ where: { code: input.code } });
  if (!codeRow) throw new Error("Referral code not found");

  if (isSelfReferral(codeRow.userId, input.invitedUserId)) {
    throw new Error("Self referral is not allowed");
  }

  const existing = await prisma.referralLink.findUnique({
    where: { invitedUserId: input.invitedUserId },
  });

  if (existing) {
    throw new Error("Referral already applied");
  }

  const link = await prisma.referralLink.create({
    data: {
      inviterUserId: codeRow.userId,
      invitedUserId: input.invitedUserId,
      referralCode: input.code,
      status: "pending",
    },
  });

  await prisma.referralCode.update({
    where: { id: codeRow.id },
    data: { uses: { increment: 1 } },
  });

  return link;
}

export async function evaluateReferral(invitedUserId: string) {
  const link = await prisma.referralLink.findUnique({
    where: { invitedUserId },
  });

  if (!link) return null;

  const invited = await prisma.user.findUnique({
    where: { id: invitedUserId },
    select: {
      id: true,
      currentLevel: true,
      suspiciousScore: true,
      engagementScore: true,
    } as any,
  });

  const scoreRow = await prisma.userEngagementScore.findUnique({
    where: { userId: invitedUserId },
  });

  const quality = computeReferralQuality({
    taps7d: scoreRow?.taps7d || 0,
    sessions7d: scoreRow?.sessions7d || 0,
    currentLevel: (invited as any)?.currentLevel || 1,
    purchases30d: scoreRow?.purchases30d || 0,
    suspiciousScore: (invited as any)?.suspiciousScore || 0,
  });

  const qualified = isReferralQualified(quality);

  const updated = await prisma.referralLink.update({
    where: { id: link.id },
    data: {
      qualityScore: quality,
      status: qualified ? "active" : "blocked",
    },
  });

  if (qualified && !updated.rewardGranted) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: updated.inviterUserId },
        data: { coins: { increment: 500 } },
      }),
      prisma.referralLink.update({
        where: { id: updated.id },
        data: {
          rewardGranted: true,
          status: "rewarded",
        },
      }),
    ]);
  }

  return updated;
}

export async function getReferralOverview(userId: string) {
  const [code, links] = await Promise.all([
    getOrCreateReferralCode(userId),
    prisma.referralLink.findMany({
      where: { inviterUserId: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const totals = {
    total: links.length,
    rewarded: links.filter((x: any) => x.rewardGranted).length,
    active: links.filter((x: any) => x.status === "active" || x.status === "rewarded").length,
    blocked: links.filter((x: any) => x.status === "blocked").length,
  };

  return { code, links, totals };
}
