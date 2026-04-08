import { Router } from "express";
import { syncPassiveIncome, claimPassiveIncome } from "../services/income.service";

const router = Router();

router.post("/sync", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const data = await syncPassiveIncome(userId);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

router.post("/claim", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const data = await claimPassiveIncome(userId);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;
