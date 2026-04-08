import { Router } from 'express';
import { z } from 'zod';
import { idempotencyMiddleware } from '../middlewares/idempotency.middleware';
import { createPremiumBoostInvoice } from '../services/payment.service';

const router = Router();

router.post('/premium/boost/create', idempotencyMiddleware('payment_boost'), async (req, res) => {
  const userId = req.user!.id;
  const body = z.object({ type: z.enum(['tap_x2', 'energy_cap', 'regen_x2']) }).parse(req.body);

  try {
    const result = await createPremiumBoostInvoice(userId, body.type);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Ozel odeme baslatilamadi' });
  }
});

export default router;
