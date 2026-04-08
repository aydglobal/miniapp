import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  BOT_USERNAME: z.string().default('adntoken_bot'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET en az 32 karakter olmalidir'),
  MINIAPP_URL: z.string().url(),
  ADMIN_SECRET: z.string().min(6).default('change-admin-secret'),
  ADMIN_TELEGRAM_USERNAME: z.string().default('aydinsagban'),
  ALLOWED_ORIGINS: z.string().optional(),
  ENABLE_PREVIEW_MODE: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.string().default('info'),
  WEBHOOK_SECRET: z.string().optional(),
  WEBHOOK_URL: z.string().optional()
});

export const env = envSchema.parse(process.env);
