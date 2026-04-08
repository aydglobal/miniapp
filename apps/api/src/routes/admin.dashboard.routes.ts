import { Router } from 'express';
import { getAdminDashboardCharts, getAdminDashboardSummary } from '../services/adminDashboard.service';

const router = Router();

router.get('/summary', async (_req, res) => {
  res.json(await getAdminDashboardSummary());
});

router.get('/charts', async (_req, res) => {
  res.json(await getAdminDashboardCharts());
});

export default router;
