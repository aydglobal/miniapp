import { Router } from "express";
import { getProfileState } from "../services/profile.service";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const data = await getProfileState(userId);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;
