import { Router } from 'express';
import { claimMissionReward, getMissionBoard } from '../services/mission.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await getMissionBoard(req.user!.id);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

router.post('/claim/:missionId', async (req, res, next) => {
  try {
    const data = await claimMissionReward(req.user!.id, String(req.params.missionId));
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;
