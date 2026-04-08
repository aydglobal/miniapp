import { Router } from "express";
import { getDailyState, claimDailyReward } from "../services/dailyReward.service";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const data = await getDailyState(userId);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

router.post("/claim", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const data = await claimDailyReward(userId);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;
