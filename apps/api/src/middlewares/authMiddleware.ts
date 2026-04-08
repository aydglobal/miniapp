import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { verifyUserToken } from '../lib/auth';
import { env } from '../lib/env';
import { logger } from '../lib/logger';
import { getTelegramUserFromInitData, verifyTelegramInitData } from '../lib/telegram';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        telegramId: string;
        username?: string | null;
        isAdmin?: boolean;
      };
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Admin secret varsa auth'u atla — req.user'ı dummy admin olarak set et
  if (req.header('x-admin-secret') === env.ADMIN_SECRET) {
    req.user = { id: 'admin', telegramId: 'admin', username: 'admin', isAdmin: true };
    return next();
  }

  try {
    const user =
      (await resolveBearerUser(req)) ||
      (await resolveTelegramHeaderUser(req));

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Yetkisiz istek'
      });
    }

    if (user.isBanned || (user.fraudLockedUntil && user.fraudLockedUntil > new Date())) {
      return res.status(403).json({
        success: false,
        message: user.isBanned ? 'Hesap engellendi' : 'Hesap guvenlik nedeniyle kilitlendi'
      });
    }

    req.user = {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      isAdmin: Boolean(user.isAdmin || normalizeUsername(user.username) === normalizeUsername(env.ADMIN_TELEGRAM_USERNAME))
    };

    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() }
    }).catch(() => null);

    next();
  } catch (error) {
    logger.error({ err: error }, 'AUTH_MIDDLEWARE_ERROR');
    return res.status(401).json({
      success: false,
      message: 'Kimlik dogrulama basarisiz'
    });
  }
}

async function resolveBearerUser(req: Request) {
  const authHeader = req.header('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const payload = verifyUserToken(authHeader.slice(7));
  return prisma.user.findUnique({ where: { id: payload.userId } });
}

async function resolveTelegramHeaderUser(req: Request) {
  // x-telegram-user-id header'ı güvenlik riski — kabul edilmiyor
  const initData = req.header('x-telegram-init-data');
  if (!initData) return null;

  const valid = verifyTelegramInitData(initData, env.TELEGRAM_BOT_TOKEN);
  if (!valid) return null;

  const telegramUser = getTelegramUserFromInitData(initData);
  if (!telegramUser) return null;

  return prisma.user.findUnique({
    where: { telegramId: String(telegramUser.id) }
  });
}

function normalizeUsername(value?: string | null) {
  return String(value || '').replace(/^@/, '').toLowerCase();
}
