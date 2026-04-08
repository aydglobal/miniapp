import { Router } from 'express';
import {
  getAnalyticsSummary,
  getMetricsTrend,
  getSegmentedUsers,
  detectAnomalies
} from '../services/analyticsAdmin.service';
import { adminOnlyMiddleware } from '../middlewares/adminOnlyMiddleware';

const router = Router();
router.use(adminOnlyMiddleware);

router.get('/summary', async (_req, res) => {
  res.json({ success: true, data: await getAnalyticsSummary() });
});

router.get('/metrics', async (req, res) => {
  const days = Number(req.query.days) || 7;
  res.json({ success: true, data: await getMetricsTrend(days) });
});

router.get('/segments', async (req, res) => {
  const { minLevel, maxLevel, segment, limit } = req.query;
  const data = await getSegmentedUsers({
    minLevel: minLevel ? Number(minLevel) : undefined,
    maxLevel: maxLevel ? Number(maxLevel) : undefined,
    segment: segment as string | undefined,
    limit: limit ? Number(limit) : undefined
  });
  res.json({ success: true, data });
});

router.get('/anomalies', async (_req, res) => {
  res.json({ success: true, data: await detectAnomalies() });
});

export default router;
