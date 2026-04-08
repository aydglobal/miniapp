import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (_req, res) => {
  const items = await prisma.withdrawalRequest.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  res.json({ success: true, items });
});

router.post('/:id/approve', async (req, res) => {
  const item = await prisma.withdrawalRequest.update({
    where: { id: req.params.id },
    data: {
      status: 'approved',
      reviewedByAdminId: (req as any).adminId || req.user!.id,
      reviewedAt: new Date(),
      adminNotes: req.body?.adminNotes || null
    }
  });
  res.json({ success: true, item });
});

router.post('/:id/reject', async (req, res) => {
  const current = await prisma.withdrawalRequest.findUnique({ where: { id: req.params.id } });
  if (!current) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }

  const item = await prisma.$transaction(async (tx) => {
    if (current.status !== 'rejected') {
      await tx.user.update({
        where: { id: current.userId },
        data: { eligibleRewardBalance: { increment: current.amountCoins } }
      });
    }

    return tx.withdrawalRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'rejected',
        reviewedByAdminId: (req as any).adminId || req.user!.id,
        reviewedAt: new Date(),
        adminNotes: req.body?.adminNotes || null
      }
    });
  });

  res.json({ success: true, item });
});

router.post('/:id/mark-paid', async (req, res) => {
  const item = await prisma.withdrawalRequest.update({
    where: { id: req.params.id },
    data: { status: 'paid', paidAt: new Date() }
  });
  res.json({ success: true, item });
});

export default router;
