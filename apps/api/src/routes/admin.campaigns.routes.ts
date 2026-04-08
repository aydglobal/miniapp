import { Router } from 'express';
import { getCampaigns, triggerCampaign } from '../services/campaignAdmin.service';

const router = Router();

router.get('/', async (_req, res) => {
  res.json({
    success: true,
    data: getCampaigns()
  });
});

router.post('/:key/trigger', async (req, res) => {
  res.json(triggerCampaign(req.params.key));
});

export default router;
