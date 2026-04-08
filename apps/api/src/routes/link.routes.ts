import { Router } from 'express';
import { env } from '../lib/env';
import { prisma } from '../lib/prisma';
import { createBotStartAppUrl, createMiniAppUrl } from '../lib/urls';

const router = Router();

router.get('/miniapp', async (req, res) => {
  const userId = req.user!.id;
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { referralCode: true }
  });

  res.json({
    miniAppUrl: createMiniAppUrl(env.MINIAPP_URL, user.referralCode),
    botStartAppUrl: createBotStartAppUrl(env.BOT_USERNAME, user.referralCode),
    referralCode: user.referralCode
  });
});

export default router;
