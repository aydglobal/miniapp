import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { getAdminNotificationSummary } from "../../services/notification.service";

const router = Router();

router.get("/summary", async (_req, res) => {
  const data = await getAdminNotificationSummary();
  res.json({ success: true, data });
});

router.get("/logs", async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 50);

  const [items, total] = await Promise.all([
    prisma.notificationLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notificationLog.count(),
  ]);

  res.json({
    success: true,
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export default router;
