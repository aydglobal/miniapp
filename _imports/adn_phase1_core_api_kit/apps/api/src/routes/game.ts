import { Router } from "express";
import { performTap } from "../services/tapEngine.service";

const router = Router();

router.post("/tap", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const nonce = typeof req.body?.nonce === "string" ? req.body.nonce : undefined;
    const data = await performTap(userId, { nonce });
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;
