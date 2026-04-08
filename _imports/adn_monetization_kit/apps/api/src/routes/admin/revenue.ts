import { Router } from "express";
import { getRevenueSummary } from "../../services/revenue.service";

const router = Router();

router.get("/", async (_req, res) => {
  const summary = await getRevenueSummary();
  res.json({ success: true, summary });
});

export default router;
