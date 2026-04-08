import { Router } from 'express';
import { z } from 'zod';
import { registerDevice } from '../services/deviceTrust.service';

const router = Router();

router.post('/register', async (req, res) => {
  const body = z.object({
    fingerprint: z.string().min(1),
    platform: z.string().optional(),
    appVersion: z.string().optional()
  }).parse(req.body);

  const device = await registerDevice({
    userId: (req as any).userId,
    fingerprint: body.fingerprint,
    platform: body.platform,
    appVersion: body.appVersion
  });

  res.json({ success: true, device });
});

export default router;
