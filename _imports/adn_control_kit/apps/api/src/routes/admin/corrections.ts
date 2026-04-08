import { Router } from "express";
import { adminAdjustBalance } from "../../services/adminCorrection.service";
import { prisma } from "../../lib/prisma";

const router = Router();

router.get("/ledger/:userId", async (req, res) => {
  const items = await prisma.walletLedgerEntry.findMany({
    where: { userId: req.params.userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  res.json({ success: true, items });
});

router.post("/balance", async (req, res) => {
  const adminUserId = req.user!.id;
  const { targetUserId, bucket, amount, note } = req.body;

  const entry = await adminAdjustBalance({
    targetUserId,
    adminUserId,
    bucket,
    amount: Number(amount),
    note,
  });

  res.json({ success: true, entry });
});

export default router;
