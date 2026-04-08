import { Router } from 'express';
import { z } from 'zod';
import { idempotencyMiddleware } from '../middlewares/idempotency.middleware';
import { getShopView, purchaseUpgrade, upgradeOwnedCard } from '../services/upgrade.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await getShopView(req.user!.id);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

router.post('/purchase', idempotencyMiddleware('shop_purchase'), async (req, res, next) => {
  try {
    const body = z.object({ cardKey: z.string().min(1) }).parse(req.body);
    const data = await purchaseUpgrade(req.user!.id, body.cardKey);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

router.post('/upgrade', idempotencyMiddleware('shop_upgrade'), async (req, res, next) => {
  try {
    const body = z.object({ cardKey: z.string().min(1) }).parse(req.body);
    const data = await upgradeOwnedCard(req.user!.id, body.cardKey);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;
