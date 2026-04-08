import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import meRoutes from './routes/me.routes';
import gameRoutes from './routes/game.routes';
import boostRoutes from './routes/boost.routes';
import paymentRoutes from './routes/payment.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import adminLogsRoutes from './routes/admin.logs.routes';
import adminDashboardRoutes from './routes/admin.dashboard.routes';
import adminUsersRoutes from './routes/admin.users.routes';
import adminFraudRoutes from './routes/admin.fraud.routes';
import adminPayoutsRoutes from './routes/admin.payouts.routes';
import adminAnalyticsRoutes from './routes/admin.analytics.routes';
import adminCampaignsRoutes from './routes/admin.campaigns.routes';
import adminEventsRoutes from './routes/admin.events.routes';
import adminTuningRoutes from './routes/admin.tuning.routes';
import adminCorrectionsRoutes from './routes/admin.corrections.routes';
import adminRevenueRoutes from './routes/admin.revenue.routes';
import adminNotificationsRoutes from './routes/admin.notifications.routes';
import adminAbTestRoutes from './routes/admin.abtest.routes';
import linkRoutes from './routes/link.routes';
import referralRoutes from './routes/referral.routes';
import referralQuestRoutes from './routes/referralQuest.routes';
import withdrawalRoutes from './routes/withdrawal.routes';
import webhookRoutes from './routes/webhook.routes';
import incomeRoutes from './routes/income.routes';
import shopRoutes from './routes/shop.routes';
import levelsRoutes from './routes/levels.routes';
import missionsRoutes from './routes/missions.routes';
import dailyRoutes from './routes/daily.routes';
import onboardingRoutes from './routes/onboarding.routes';
import clanRoutes from './routes/clan.routes';
import chestRoutes from './routes/chest.routes';
import prestigeRoutes from './routes/prestige.routes';
import deviceRoutes from './routes/device.routes';
import { env } from './lib/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import { authMiddleware } from './middlewares/authMiddleware';
import { adminOnlyMiddleware } from './middlewares/adminOnlyMiddleware';
import { runNotificationWorker } from './workers/notification.worker';
import { runAnalyticsDailyJob } from './workers/analyticsDaily.worker';

const app = express();
app.set('trust proxy', 1); // Render/Vercel proxy desteği

// CORS — sadece izin verilen origin'ler
const allowedOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [env.MINIAPP_URL];

function isAllowedOrigin(origin: string) {
  if (allowedOrigins.includes(origin)) return true;

  try {
    const originUrl = new URL(origin);
    const miniAppUrl = new URL(env.MINIAPP_URL);

    const isLocalPreview =
      originUrl.hostname === 'localhost' ||
      originUrl.hostname === '127.0.0.1';

    if (isLocalPreview) {
      if (env.NODE_ENV !== 'production') return true;

      return allowedOrigins.some((allowedOrigin) => {
        try {
          const allowedUrl = new URL(allowedOrigin);
          return allowedUrl.hostname === originUrl.hostname && allowedUrl.port === originUrl.port;
        } catch {
          return false;
        }
      });
    }

    const isVercelPreview =
      originUrl.hostname.endsWith('.vercel.app') &&
      miniAppUrl.hostname.endsWith('.vercel.app');

    if (isVercelPreview) return true;
  } catch {
    return false;
  }

  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      // webhook ve server-to-server istekler için origin olmayabilir
      if (!origin) return callback(null, true);
      // Telegram WebApp'ten gelen istekler — null origin veya t.me origin
      if (origin.includes('telegram') || origin.includes('t.me')) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, true);
      // Render static site'lar için onrender.com domain'lerini izin ver
      if (origin.endsWith('.onrender.com')) return callback(null, true);
      callback(new Error(`CORS: ${origin} izin verilmiyor`));
    },
    credentials: true
  })
);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Cok fazla istek. Lutfen bekleyin.' },
  standardHeaders: true,
  legacyHeaders: false
});

const tapLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip || ''),
  message: { success: false, message: 'Cok fazla tap istegi.' },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'Cok fazla istek. Lutfen bekleyin.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Health check — DB bağlantı testi dahil
app.get('/health', async (_req, res) => {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('db_timeout')), 3000))
    ]);
    res.json({ ok: true, db: 'connected', service: 'telegram-miniapp-api', time: new Date().toISOString() });
  } catch (error) {
    logger.error({ err: error }, 'health_check_db_failed');
    res.status(503).json({ ok: false, db: 'disconnected', error: String(error) });
  }
});

app.get('/', (_req, res) => {
  res.json({ message: 'API is running' });
});

// Webhook — CORS ve rate limit'ten muaf
app.use('/webhooks', webhookRoutes);

// Auth — rate limit uygulanır
app.use('/auth', authLimiter, authRoutes);

// Tap endpoint'leri için özel limiter
app.use('/game/tap', tapLimiter);
app.use('/api/game/tap', tapLimiter);

// Genel limiter — tüm diğer route'lar
app.use(generalLimiter);

app.use('/profile', authMiddleware, profileRoutes);
app.use('/boosts', authMiddleware, boostRoutes);
app.use('/game', authMiddleware, gameRoutes);
app.use('/leaderboard', authMiddleware, leaderboardRoutes);
app.use('/payments', authMiddleware, paymentRoutes);
app.use('/links', authMiddleware, linkRoutes);
app.use('/referral', authMiddleware, referralRoutes);
app.use('/withdrawals', authMiddleware, withdrawalRoutes);
app.use('/referral-quests', authMiddleware, referralQuestRoutes);
app.use('/income', authMiddleware, incomeRoutes);
app.use('/shop', authMiddleware, shopRoutes);
app.use('/levels', authMiddleware, levelsRoutes);
app.use('/missions', authMiddleware, missionsRoutes);
app.use('/daily', authMiddleware, dailyRoutes);
app.use('/onboarding', authMiddleware, onboardingRoutes);
app.use('/clans', authMiddleware, clanRoutes);
app.use('/chests', authMiddleware, chestRoutes);
app.use('/prestige', authMiddleware, prestigeRoutes);

app.use('/api/me', authMiddleware, meRoutes);
app.use('/api/game', authMiddleware, gameRoutes);
app.use('/api/boosts', authMiddleware, boostRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/links', authMiddleware, linkRoutes);
app.use('/api/profile', authMiddleware, profileRoutes);
app.use('/api/referral', authMiddleware, referralRoutes);
app.use('/api/withdrawals', authMiddleware, withdrawalRoutes);
app.use('/api/referral-quests', authMiddleware, referralQuestRoutes);
app.use('/api/income', authMiddleware, incomeRoutes);
app.use('/api/shop', authMiddleware, shopRoutes);
app.use('/api/levels', authMiddleware, levelsRoutes);
app.use('/api/missions', authMiddleware, missionsRoutes);
app.use('/api/daily', authMiddleware, dailyRoutes);
app.use('/api/onboarding', authMiddleware, onboardingRoutes);
app.use('/api/clans', authMiddleware, clanRoutes);
app.use('/api/chests', authMiddleware, chestRoutes);
app.use('/api/prestige', authMiddleware, prestigeRoutes);
app.use('/api/device', authMiddleware, deviceRoutes);

app.use('/admin/dashboard', authMiddleware, adminOnlyMiddleware, adminDashboardRoutes);
app.use('/admin/users', authMiddleware, adminOnlyMiddleware, adminUsersRoutes);
app.use('/admin/fraud', authMiddleware, adminOnlyMiddleware, adminFraudRoutes);
app.use('/admin/logs', authMiddleware, adminOnlyMiddleware, adminLogsRoutes);
app.use('/admin/payouts', authMiddleware, adminOnlyMiddleware, adminPayoutsRoutes);
app.use('/admin/analytics', authMiddleware, adminOnlyMiddleware, adminAnalyticsRoutes);
app.use('/admin/events', authMiddleware, adminOnlyMiddleware, adminEventsRoutes);
app.use('/admin/tuning', authMiddleware, adminOnlyMiddleware, adminTuningRoutes);
app.use('/admin/campaigns', authMiddleware, adminOnlyMiddleware, adminCampaignsRoutes);
app.use('/admin/corrections', authMiddleware, adminOnlyMiddleware, adminCorrectionsRoutes);
app.use('/admin/revenue', authMiddleware, adminOnlyMiddleware, adminRevenueRoutes);
app.use('/admin/notifications', authMiddleware, adminOnlyMiddleware, adminNotificationsRoutes);
app.use('/admin/ab-tests', authMiddleware, adminOnlyMiddleware, adminAbTestRoutes);

app.use('/api/admin/dashboard', authMiddleware, adminOnlyMiddleware, adminDashboardRoutes);
app.use('/api/admin/users', authMiddleware, adminOnlyMiddleware, adminUsersRoutes);
app.use('/api/admin/fraud', authMiddleware, adminOnlyMiddleware, adminFraudRoutes);
app.use('/api/admin/logs', authMiddleware, adminOnlyMiddleware, adminLogsRoutes);
app.use('/api/admin/payouts', authMiddleware, adminOnlyMiddleware, adminPayoutsRoutes);
app.use('/api/admin/analytics', authMiddleware, adminOnlyMiddleware, adminAnalyticsRoutes);
app.use('/api/admin/events', authMiddleware, adminOnlyMiddleware, adminEventsRoutes);
app.use('/api/admin/tuning', authMiddleware, adminOnlyMiddleware, adminTuningRoutes);
app.use('/api/admin/campaigns', authMiddleware, adminOnlyMiddleware, adminCampaignsRoutes);
app.use('/api/admin/corrections', authMiddleware, adminOnlyMiddleware, adminCorrectionsRoutes);
app.use('/api/admin/revenue', authMiddleware, adminOnlyMiddleware, adminRevenueRoutes);
app.use('/api/admin/notifications', authMiddleware, adminOnlyMiddleware, adminNotificationsRoutes);
app.use('/api/admin/ab-tests', authMiddleware, adminOnlyMiddleware, adminAbTestRoutes);

app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Istenen adres bulunamadi'
  });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'SERVER_ERROR');
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Sunucu hatasi'
  });
});

// Graceful shutdown — SIGTERM'de mevcut istekler tamamlanır
const server = app.listen(Number(env.PORT), '0.0.0.0', () => {
  logger.info({ port: env.PORT }, 'server_started');

  setInterval(() => {
    runNotificationWorker().catch((err) => logger.error({ err }, 'notification_worker_error'));
  }, 10 * 60 * 1000);

  // Render ücretsiz plan uyku önleme — her 10 dakikada self-ping
  setInterval(() => {
    fetch(`http://localhost:${env.PORT}/health`).catch(() => null);
  }, 10 * 60 * 1000);

  const scheduleAnalyticsJob = () => {
    const now = new Date();
    const nextRun = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 5, 0));
    const msUntilNextRun = nextRun.getTime() - now.getTime();
    setTimeout(() => {
      runAnalyticsDailyJob().catch((err) => logger.error({ err }, 'analytics_daily_job_error'));
      setInterval(() => {
        runAnalyticsDailyJob().catch((err) => logger.error({ err }, 'analytics_daily_job_error'));
      }, 24 * 60 * 60 * 1000);
    }, msUntilNextRun);
    logger.info({ msUntilNextRun }, 'analytics_job_scheduled');
  };
  scheduleAnalyticsJob();
});

function gracefulShutdown(signal: string) {
  logger.info({ signal }, 'shutdown_signal_received');
  server.close(async () => {
    logger.info('http_server_closed');
    await prisma.$disconnect();
    logger.info('db_disconnected');
    process.exit(0);
  });

  // 10 saniye içinde kapanmazsa zorla kapat
  setTimeout(() => {
    logger.error('forced_shutdown');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
