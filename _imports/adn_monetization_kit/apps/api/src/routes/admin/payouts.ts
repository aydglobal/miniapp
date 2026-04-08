import { Router } from "express";
import { listPayoutRequests } from "../../services/revenue.service";
import { approveWithdrawal, markWithdrawalSent, rejectWithdrawal } from "../../services/withdrawal.service";

const router = Router();

router.get("/", async (req, res) => {
  const page = Number(req.query.page || 1);
  const data = await listPayoutRequests(page, 20);
  res.json({ success: true, ...data });
});

router.post("/:id/approve", async (req, res) => {
  try {
    const item = await approveWithdrawal(req.params.id);
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post("/:id/send", async (req, res) => {
  try {
    const item = await markWithdrawalSent(req.params.id, req.body.externalTxId);
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post("/:id/reject", async (req, res) => {
  try {
    const item = await rejectWithdrawal(req.params.id, req.body.rejectionReason || "Rejected by admin");
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
