import { Router } from 'express';
import { z } from 'zod';
import { AntiCheatError } from '../lib/antiCheat';
import { idempotencyMiddleware } from '../middlewares/idempotency.middleware';
import { collectMiningIncome, completeAirdropTask, getAirdropDashboard, submitClaimRequest, tapUser } from '../services/game.service';
import { getPublicLiveEvents } from '../services/liveOpsAdmin.service';

const router = Router();

router.post('/tap', idempotencyMiddleware('game_tap'), async (req, res) => {
  const userId = req.user!.id;
  const body = z.object({
    taps: z.number().int().min(1).max(50).default(1),
    clientNonce: z.number().int().nonnegative().optional()
  }).parse(req.body);

  try {
    const result = await tapUser(userId, body.taps, body.clientNonce);
    res.json(result);
  } catch (error) {
    if (error instanceof AntiCheatError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    throw error;
  }
});

router.post('/collect', async (req, res) => {
  const userId = req.user!.id;

  try {
    const result = await collectMiningIncome(userId);
    res.json(result);
  } catch (error) {
    if (error instanceof AntiCheatError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    throw error;
  }
});

router.get('/leaderboard', async (_req, res) => {
  const { getSafeLeaderboard } = await import('../services/leaderboard.service');
  const users = await getSafeLeaderboard(20);
  res.json(users);
});

router.get('/live-events', async (_req, res) => {
  res.json(getPublicLiveEvents());
});

router.get('/airdrop', async (req, res) => {
  const userId = req.user!.id;
  const dashboard = await getAirdropDashboard(userId);
  res.json(dashboard);
});

router.post('/airdrop/task', async (req, res) => {
  const userId = req.user!.id;
  const body = z.object({ code: z.string().min(1) }).parse(req.body);

  try {
    await completeAirdropTask(userId, body.code);
    const dashboard = await getAirdropDashboard(userId);
    res.json(dashboard);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Gorev tamamlama basarisiz' });
  }
});

router.post('/airdrop/claim', async (req, res) => {
  const userId = req.user!.id;
  const body = z.object({ walletAddress: z.string().min(12).max(128) }).parse(req.body);

  try {
    const result = await submitClaimRequest(userId, body.walletAddress);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Cekim talebi basarisiz' });
  }
});

export default router;
