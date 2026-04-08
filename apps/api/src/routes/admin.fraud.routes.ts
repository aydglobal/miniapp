import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { parsePagination } from '../lib/adminUtils';
import { listFraudCases, resolveFraudCase } from '../services/adminFraud.service';
import { suspendAccount } from '../services/fraudDetection.service';
import { adminOnlyMiddleware } from '../middlewares/adminOnlyMiddleware';

const router = Router();
router.use(adminOnlyMiddleware);

// Mevcut fraud case listesi
router.get('/cases', async (req, res) => {
  const { page, limit, skip } = parsePagination(req);
  const data = await listFraudCases({
    status: req.query.status as string | undefined,
    q: req.query.q as string | undefined,
    skip,
    limit
  });
  res.json({ ...data, page, limit });
});

router.post('/cases/:id/review', async (req, res) => {
  const body = z.object({
    status: z.enum(['resolved', 'false_positive', 'reviewing']),
    note: z.string().optional()
  }).parse(req.body);

  const data = await resolveFraudCase({
    caseId: req.params.id,
    adminId: (req as any).adminId || req.user!.id,
    status: body.status,
    note: body.note
  });

  res.json(data);
});

// Fraud ops özet (FraudCase modeli kullanıyor)
router.get('/ops/summary', async (_req, res) => {
  const [openCases, lockedUsers, riskyDevices] = await Promise.all([
    prisma.fraudCase.count({ where: { status: 'open' } }),
    prisma.user.count({ where: { fraudLockedUntil: { gt: new Date() } } }),
    prisma.userDevice.count({ where: { trustStatus: 'risky' } })
  ]);

  res.json({ success: true, summary: { openCases, lockedUsers, riskyDevices } });
});

// Kullanıcıyı geçici kilitle
router.post('/ops/users/:userId/lock', async (req, res) => {
  const minutes = Number(req.body.minutes || 60);
  const until = new Date(Date.now() + minutes * 60 * 1000);

  const user = await prisma.user.update({
    where: { id: req.params.userId },
    data: { fraudLockedUntil: until, isFraudLocked: true }
  });

  await prisma.adminAction.create({
    data: {
      adminId: (req as any).adminId || req.user!.id,
      targetUserId: req.params.userId,
      action: 'fraud_lock',
      reason: `Locked for ${minutes} minutes`,
      meta: { until: until.toISOString() }
    }
  });

  res.json({ success: true, user });
});

// Hesabı askıya al (suspend)
router.post('/suspend/:userId', async (req, res) => {
  const { reason } = req.body;
  await suspendAccount(req.params.userId, reason || 'Admin action', req.user!.id);
  res.json({ success: true });
});

export default router;
