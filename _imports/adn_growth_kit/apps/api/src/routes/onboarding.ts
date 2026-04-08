import { Router } from "express";
import { getTutorialState, markTutorialStep } from "../services/onboarding.service";

const router = Router();

router.get("/", async (req, res) => {
  const state = await getTutorialState(req.user!.id);
  res.json({ success: true, state });
});

router.post("/step", async (req, res) => {
  const { step } = req.body;
  const allowed = ["introSeen", "firstTapDone", "firstUpgradeDone", "firstMissionDone", "referralSeen"];
  if (!allowed.includes(step)) {
    return res.status(400).json({ success: false, message: "Invalid step" });
  }

  const state = await markTutorialStep({
    userId: req.user!.id,
    step,
  });

  res.json({ success: true, state });
});

export default router;
