import { Router } from 'express';
import { getLiveTuningConfig, updateLiveTuningConfig } from '../services/adminConfig.service';

const router = Router();

router.get('/', async (_req, res) => {
  res.json({
    success: true,
    data: getLiveTuningConfig()
  });
});

router.post('/', async (req, res) => {
  res.json({
    success: true,
    data: updateLiveTuningConfig(req.body || {})
  });
});

export default router;
