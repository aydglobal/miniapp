import { Router } from 'express';
import { getChestVault, openChest } from '../services/chest.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await getChestVault(req.user!.id);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

router.post('/open/:chestId', async (req, res, next) => {
  try {
    const data = await openChest(req.user!.id, String(req.params.chestId));
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;
