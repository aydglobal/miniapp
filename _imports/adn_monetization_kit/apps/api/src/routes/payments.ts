import { Router } from "express";
import { createStarsPayment, markStarsPaymentPaid } from "../services/payment.service";

const router = Router();

router.get("/products", async (_req, res) => {
  const { MONETIZATION_PRODUCTS } = await import("../lib/monetization.constants");
  res.json({ success: true, items: MONETIZATION_PRODUCTS });
});

router.post("/stars/create", async (req: any, res) => {
  try {
    const { productKey } = req.body;
    const data = await createStarsPayment(req.user.id, productKey);
    res.json({ success: true, ...data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post("/stars/webhook", async (req, res) => {
  try {
    const { invoicePayload, telegramChargeId, providerChargeId } = req.body;
    const payment = await markStarsPaymentPaid({ invoicePayload, telegramChargeId, providerChargeId });
    res.json({ success: true, payment });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
