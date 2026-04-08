import { Router } from 'express';
import { createTest, concludeTest, rolloutWinner } from '../services/abTest.service';
import { adminOnlyMiddleware } from '../middlewares/adminOnlyMiddleware';
import { prisma } from '../lib/prisma';

const router = Router();
router.use(adminOnlyMiddleware);

router.get('/', async (_req, res) => {
  const data = await prisma.aBTest.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data });
});

router.post('/', async (req, res) => {
  const data = await createTest(req.body);
  res.json({ success: true, data });
});

router.post('/:id/conclude', async (req, res) => {
  const { winnerVariant } = req.body;
  const data = await concludeTest(req.params.id, winnerVariant);
  res.json({ success: true, data });
});

router.post('/:id/rollout', async (req, res) => {
  const data = await rolloutWinner(req.params.id);
  res.json({ success: true, data });
});

export default router;
