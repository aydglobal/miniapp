import { Router } from 'express';
import { getReferralOverview } from '../services/referral.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await getReferralOverview(req.user!.id);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;
