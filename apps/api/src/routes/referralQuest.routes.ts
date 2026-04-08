import { Router } from 'express';
import { listReferralQuestProgress, listReferralTasks } from '../services/referralQuest.service';

const router = Router();

router.get('/', async (req, res) => {
  const items = await listReferralQuestProgress(req.user!.id);
  res.json({ success: true, items });
});

router.get('/tasks', async (req, res) => {
  const items = await listReferralTasks(req.user!.id);
  res.json({ success: true, items });
});

export default router;
