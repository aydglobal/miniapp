import { Router } from "express";
import { getGlobalLeaderboard } from "../services/leaderboard.service";

const router = Router();

router.get("/global", async (req, res) => {
  const limit = Number(req.query.limit || 100);
  const items = await getGlobalLeaderboard(limit);
  res.json({ success: true, items });
});

export default router;
