import { Router } from 'express';
import { activatePrestige, getPrestigeStatus } from '../services/prestige.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await getPrestigeStatus(req.user!.id);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

router.post('/activate', async (req, res, next) => {
  try {
    const data = await activatePrestige(req.user!.id);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;
