import { Router } from 'express';
import { z } from 'zod';
import { getTutorialState, markTutorialStep } from '../services/onboarding.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const state = await getTutorialState(req.user!.id);
    res.json({ success: true, state });
  } catch (error) {
    next(error);
  }
});

router.post('/step', async (req, res, next) => {
  try {
    const body = z.object({
      step: z.enum(['introSeen', 'firstTapDone', 'firstUpgradeDone', 'firstMissionDone', 'referralSeen'])
    }).parse(req.body);
    const state = await markTutorialStep({ userId: req.user!.id, step: body.step });
    res.json({ success: true, state });
  } catch (error) {
    next(error);
  }
});

export default router;
