import { Router } from "express";
import { applyReferralCode, evaluateReferral, getReferralOverview } from "../services/referral.service";

const router = Router();

router.get("/", async (req, res) => {
  const data = await getReferralOverview(req.user!.id);
  res.json({ success: true, ...data });
});

router.post("/apply", async (req, res) => {
  const { code } = req.body;
  const link = await applyReferralCode({
    invitedUserId: req.user!.id,
    code,
  });

  res.json({ success: true, link });
});

router.post("/evaluate", async (req, res) => {
  const result = await evaluateReferral(req.user!.id);
  res.json({ success: true, result });
});

export default router;
