import { Router } from 'express';
import { getSafeLeaderboard } from '../services/leaderboard.service';

const router = Router();

router.get('/', async (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
  const leaderboard = await getSafeLeaderboard(limit);
  res.json(leaderboard);
});

export default router;
