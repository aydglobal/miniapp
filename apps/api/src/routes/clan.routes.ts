import { Router } from 'express';
import { z } from 'zod';
import { createClan, getClanOverview, joinClan } from '../services/clan.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await getClanOverview(req.user!.id);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

router.post('/create', async (req, res, next) => {
  try {
    const body = z.object({
      name: z.string().min(3).max(32),
      description: z.string().max(180).optional()
    }).parse(req.body);
    const clan = await createClan({
      userId: req.user!.id,
      name: body.name,
      description: body.description
    });
    res.json({ success: true, clan });
  } catch (error) {
    next(error);
  }
});

router.post('/join', async (req, res, next) => {
  try {
    const body = z.object({
      clanId: z.string().optional(),
      slug: z.string().optional()
    }).refine((value) => Boolean(value.clanId || value.slug), {
      message: 'clanId or slug is required'
    }).parse(req.body);

    const membership = await joinClan({
      userId: req.user!.id,
      clanId: body.clanId,
      slug: body.slug
    });
    res.json({ success: true, membership });
  } catch (error) {
    next(error);
  }
});

export default router;
