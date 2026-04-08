import { Router } from 'express';
import { syncLevelState } from '../services/level.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await syncLevelState(req.user!.id);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

router.post('/sync', async (req, res, next) => {
  try {
    const data = await syncLevelState(req.user!.id);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;
