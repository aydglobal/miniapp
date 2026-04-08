import { Router } from 'express';
import { getRevenueSummary, listPayoutRequests } from '../services/revenue.service';

const router = Router();

router.get('/summary', async (_req, res) => {
  res.json({ success: true, data: await getRevenueSummary() });
});

router.get('/payouts', async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  res.json({ success: true, data: await listPayoutRequests(page, limit) });
});

export default router;
