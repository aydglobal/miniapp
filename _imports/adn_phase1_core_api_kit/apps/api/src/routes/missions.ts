import { Router } from "express";
import { getMissionBoard, claimMissionReward } from "../services/mission.service";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const data = await getMissionBoard(userId);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

router.post("/claim/:missionId", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const missionId = String(req.params.missionId);
    const data = await claimMissionReward(userId, missionId);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;
