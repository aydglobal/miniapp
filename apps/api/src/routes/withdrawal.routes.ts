import { Router } from 'express';
import { z } from 'zod';
import { listUserWithdrawals, createWithdrawalRequest } from '../services/withdrawal.service';

const router = Router();

router.get('/', async (req, res) => {
  const items = await listUserWithdrawals(req.user!.id);
  res.json({ success: true, items });
});

router.post('/', async (req, res) => {
  const body = z.object({
    method: z.enum(['ton', 'usdt_trc20', 'usdt_ton']),
    amountCoins: z.number().int().positive(),
    payoutAddress: z.string().min(4).max(255)
  }).parse(req.body);

  try {
    const item = await createWithdrawalRequest({
      userId: req.user!.id,
      method: body.method,
      amountCoins: body.amountCoins,
      payoutAddress: body.payoutAddress
    });
    res.json({ success: true, item });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Withdrawal failed' });
  }
});

export default router;
