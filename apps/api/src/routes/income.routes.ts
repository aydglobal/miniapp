import { Router } from 'express';
import { idempotencyMiddleware } from '../middlewares/idempotency.middleware';
import { claimPassiveIncome, syncPassiveIncome } from '../services/income.service';

const router = Router();

router.post('/sync', async (req, res, next) => {
  try {
    const data = await syncPassiveIncome(req.user!.id);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

router.post('/claim', idempotencyMiddleware('income_claim'), async (req, res, next) => {
  try {
    const data = await claimPassiveIncome(req.user!.id);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;
