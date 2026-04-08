import { Router } from 'express';
import { z } from 'zod';
import { adminAdjustBalance } from '../services/adminCorrection.service';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/ledger/:userId', async (req, res) => {
  const items = await prisma.walletLedgerEntry.findMany({
    where: { userId: req.params.userId },
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  res.json({ success: true, items });
});

router.post('/balance', async (req, res) => {
  const body = z.object({
    targetUserId: z.string(),
    bucket: z.enum(['coins', 'adnBalance', 'eligibleRewardBalance']),
    amount: z.number(),
    note: z.string()
  }).parse(req.body);

  const result = await adminAdjustBalance({
    targetUserId: body.targetUserId,
    adminUserId: (req as any).adminId,
    bucket: body.bucket,
    amount: body.amount,
    note: body.note
  });

  res.json({ success: true, user: result });
});

export default router;
