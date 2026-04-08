import { Router } from 'express';
import {
  getLiveEvents,
  startLiveEvent,
  stopLiveEvent,
  createLiveEvent,
  updateLiveEvent,
  deleteLiveEvent,
  getActiveEventsWithStats
} from '../services/liveOpsAdmin.service';
import { adminOnlyMiddleware } from '../middlewares/adminOnlyMiddleware';

const router = Router();
router.use(adminOnlyMiddleware);

router.get('/', async (_req, res) => {
  const data = await getLiveEvents();
  res.json({ success: true, data });
});

router.get('/active', async (_req, res) => {
  const data = await getActiveEventsWithStats();
  res.json({ success: true, data });
});

router.post('/', async (req, res) => {
  const { key, title, startsAt, endsAt, modifiersJson, isEnabled } = req.body;
  const data = await createLiveEvent({ key, title, startsAt: new Date(startsAt), endsAt: new Date(endsAt), modifiersJson, isEnabled });
  res.json({ success: true, data });
});

router.put('/:key', async (req, res) => {
  const { title, startsAt, endsAt, modifiersJson, isEnabled } = req.body;
  const data = await updateLiveEvent(req.params.key, {
    title,
    startsAt: startsAt ? new Date(startsAt) : undefined,
    endsAt: endsAt ? new Date(endsAt) : undefined,
    modifiersJson,
    isEnabled
  });
  res.json({ success: true, data });
});

router.delete('/:key', async (req, res) => {
  await deleteLiveEvent(req.params.key);
  res.json({ success: true });
});

router.post('/:key/start', async (req, res) => {
  const data = await startLiveEvent(req.params.key);
  res.json({ success: true, data });
});

router.post('/:key/stop', async (req, res) => {
  const data = await stopLiveEvent(req.params.key);
  res.json({ success: true, data });
});

export default router;
