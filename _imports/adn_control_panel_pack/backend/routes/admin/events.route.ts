import { Router } from "express";
import { getLiveEvents, startLiveEvent, stopLiveEvent } from "../../services/liveOpsAdmin.service";

const router = Router();

router.get("/", async (_req, res) => {
  res.json({
    success: true,
    data: getLiveEvents(),
  });
});

router.post("/:key/start", async (req, res) => {
  res.json(startLiveEvent(req.params.key));
});

router.post("/:key/stop", async (req, res) => {
  res.json(stopLiveEvent(req.params.key));
});

export default router;
