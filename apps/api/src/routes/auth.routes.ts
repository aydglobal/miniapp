import { Router } from 'express';
import { z } from 'zod';
import { env } from '../lib/env';
import { logger } from '../lib/logger';
import { getTelegramUserFromInitData, verifyTelegramInitData } from '../lib/telegram';
import { signUserToken } from '../lib/auth';
import { getOrCreateUserByTelegram } from '../services/game.service';
import { registerDevice } from '../services/deviceTrust.service';

const router = Router();

function normalizeOrigin(value: string) {
  return value.replace(/\/+$/, '').toLowerCase();
}

function canUsePreviewFromRequest(origin?: string | null) {
  if (env.ENABLE_PREVIEW_MODE === 'true') return true;

  // Server-to-server veya origin yok → izin ver
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const hostname = originUrl.hostname;

    // Localhost her zaman izin verilir
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;

    // Vercel preview ve production deploy'ları
    if (hostname.endsWith('.vercel.app')) return true;

    // MINIAPP_URL ile eşleşen origin
    return normalizeOrigin(origin) === normalizeOrigin(new URL(env.MINIAPP_URL).origin);
  } catch {
    return false;
  }
}

router.post('/telegram', async (req, res) => {
  const bodySchema = z.object({
    initData: z.string().min(1),
    referralCode: z.string().optional(),
    fingerprint: z.string().optional(),
    platform: z.string().optional()
  });

  const body = bodySchema.parse(req.body);

  const valid = verifyTelegramInitData(body.initData, env.TELEGRAM_BOT_TOKEN);
  if (!valid) {
    return res.status(401).json({ message: 'Telegram giris verisi gecersiz veya suresi dolmus' });
  }

  const tgUser = getTelegramUserFromInitData(body.initData);
  if (!tgUser) {
    return res.status(400).json({ message: 'Telegram kullanici verisi bulunamadi' });
  }

  const user = await getOrCreateUserByTelegram({
    telegramId: String(tgUser.id),
    displayName: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '),
    username: tgUser.username,
    referralCode: body.referralCode
  });

  if (body.fingerprint) {
    registerDevice({ userId: user.id, fingerprint: body.fingerprint, platform: body.platform }).catch(() => null);
  }

  const token = signUserToken(user.id);
  logger.info({ userId: user.id }, 'telegram_auth_success');
  return res.json({ token, user });
});

router.post('/preview', async (req, res) => {
  // Production'da preview mode kapalı
  if (!canUsePreviewFromRequest(req.get('origin'))) {
    return res.status(403).json({ message: 'Preview mode devre disi' });
  }

  const bodySchema = z.object({
    previewId: z.string().min(3),
    referralCode: z.string().optional()
  });

  const body = bodySchema.parse(req.body);
  const user = await getOrCreateUserByTelegram({
    telegramId: `preview_${body.previewId}`,
    displayName: 'ADN Preview User',
    username: `preview_${body.previewId}`,
    referralCode: body.referralCode
  });

  const token = signUserToken(user.id);
  return res.json({ token, user });
});

export default router;
