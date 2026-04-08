import { Router } from 'express';
import { z } from 'zod';
import { parsePagination } from '../lib/adminUtils';
import { banUser, listUsers, lockFraudUser, unbanUser } from '../services/adminUsers.service';

const router = Router();

router.get('/', async (req, res) => {
  const { page, limit, skip } = parsePagination(req);
  const data = await listUsers({
    q: req.query.q as string | undefined,
    status: req.query.status as string | undefined,
    skip,
    limit
  });
  res.json({ ...data, page, limit });
});

router.post('/:id/ban', async (req, res) => {
  const body = z.object({ reason: z.string().optional() }).parse(req.body);
  res.json(await banUser({ adminId: (req as any).adminId, userId: req.params.id, reason: body.reason }));
});

router.post('/:id/unban', async (req, res) => {
  const body = z.object({ reason: z.string().optional() }).parse(req.body);
  res.json(await unbanUser({ adminId: (req as any).adminId, userId: req.params.id, reason: body.reason }));
});

router.post('/:id/fraud-lock', async (req, res) => {
  const body = z.object({ reason: z.string().optional() }).parse(req.body);
  res.json(await lockFraudUser({ adminId: (req as any).adminId, userId: req.params.id, reason: body.reason }));
});

export default router;
