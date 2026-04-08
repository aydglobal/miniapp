import { Router } from "express";
import { registerDevice } from "../services/deviceTrust.service";

const router = Router();

router.post("/register", async (req, res) => {
  const userId = req.user!.id;
  const { fingerprint, platform, appVersion } = req.body;

  if (!fingerprint) {
    return res.status(400).json({ success: false, message: "fingerprint required" });
  }

  const device = await registerDevice({
    userId,
    fingerprint,
    platform,
    appVersion,
  });

  res.json({ success: true, device });
});

export default router;
