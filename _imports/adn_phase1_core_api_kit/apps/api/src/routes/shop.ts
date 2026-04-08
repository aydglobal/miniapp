import { Router } from "express";
import { getShopView, purchaseUpgrade, upgradeOwnedCard } from "../services/upgrade.service";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const data = await getShopView(userId);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

router.post("/purchase", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const cardKey = String(req.body.cardKey || "");
    const data = await purchaseUpgrade(userId, cardKey);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

router.post("/upgrade", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const cardKey = String(req.body.cardKey || "");
    const data = await upgradeOwnedCard(userId, cardKey);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;
