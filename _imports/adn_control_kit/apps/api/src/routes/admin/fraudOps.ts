import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { resolveFraudCase } from "../../services/adminCorrection.service";

const router = Router();

router.get("/summary", async (_req, res) => {
  const [openCases, lockedUsers, riskyDevices] = await Promise.all([
    prisma.fraudReviewCase.count({ where: { status: "open" } }),
    prisma.user.count({ where: { fraudLockedUntil: { gt: new Date() } } }),
    prisma.userDevice.count({ where: { trustStatus: "risky" } }),
  ]);

  res.json({
    success: true,
    summary: { openCases, lockedUsers, riskyDevices },
  });
});

router.get("/cases", async (_req, res) => {
  const items = await prisma.fraudReviewCase.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: true },
  });
  res.json({ success: true, items });
});

router.post("/cases/:caseId/resolve", async (req, res) => {
  const updated = await resolveFraudCase({
    caseId: req.params.caseId,
    adminUserId: req.user!.id,
    resolutionNote: req.body.resolutionNote || "resolved",
    status: req.body.status || "resolved",
  });

  res.json({ success: true, updated });
});

router.post("/users/:userId/lock", async (req, res) => {
  const minutes = Number(req.body.minutes || 60);
  const until = new Date(Date.now() + minutes * 60 * 1000);

  const user = await prisma.user.update({
    where: { id: req.params.userId },
    data: { fraudLockedUntil: until },
  });

  res.json({ success: true, user });
});

export default router;
