import { Router } from "express";
import { syncLevelState } from "../services/level.service";

const router = Router();

router.post("/sync", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const data = await syncLevelState(userId);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;
