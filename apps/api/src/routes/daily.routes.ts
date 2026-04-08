import { Router } from 'express';
import { idempotencyMiddleware } from '../middlewares/idempotency.middleware';
import { claimDailyReward, getDailyState } from '../services/dailyReward.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await getDailyState(req.user!.id);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

router.post('/claim', idempotencyMiddleware('daily_claim'), async (req, res, next) => {
  try {
    const data = await claimDailyReward(req.user!.id);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;
