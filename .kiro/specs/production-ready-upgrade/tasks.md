# Implementation Plan: Production-Ready Upgrade

## Overview

Incremental hardening of the ADN Token monorepo across security, game integrity, infrastructure, database, and frontend layers. Each task builds on the previous and ends with all components wired together.

## Tasks

- [ ] 1. Install dependencies
  - Add `express-rate-limit` to `apps/api/package.json` dependencies
  - Add `pino` and `pino-pretty` to `apps/api/package.json` dependencies
  - Add `@fingerprintjs/fingerprintjs` to `apps/web/package.json` dependencies
  - Run `npm install` (or equivalent) in each affected workspace
  - _Requirements: 21.1, 21.2, 21.3_

- [ ] 2. Extend env schema and add logger
  - [ ] 2.1 Update `apps/api/src/lib/env.ts`
    - Change `JWT_SECRET` validator to `.min(32, 'JWT_SECRET en az 32 karakter olmalidir')`
    - Add `ALLOWED_ORIGINS: z.string().optional()`
    - Add `ENABLE_PREVIEW_MODE: z.string().optional()`
    - Add `NODE_ENV: z.enum(['development','production','test']).default('development')`
    - Add `LOG_LEVEL: z.string().default('info')`
    - Add `WEBHOOK_SECRET: z.string().optional()`
    - Add `WEBHOOK_URL: z.string().optional()`
    - _Requirements: 4.1, 4.2, 4.3, 2.1, 11.2, 20.4_

  - [ ]* 2.2 Write property test for JWT secret length validation
    - **Property 3: JWT Secret Uzunluk Validasyonu**
    - File: `apps/api/src/lib/__tests__/env.test.ts`
    - Use `fc.string({ minLength: 1, maxLength: 100 })` — strings shorter than 32 chars must be rejected, 32+ accepted
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [ ] 2.3 Create `apps/api/src/lib/logger.ts`
    - Import `pino` and `env`
    - Export `logger` instance with `level: env.LOG_LEVEL`, `base: { service: 'telegram-miniapp-api' }`
    - Use `pino-pretty` transport when `env.NODE_ENV === 'development'`
    - _Requirements: 20.1, 20.2, 20.4, 20.5_

  - [ ]* 2.4 Write property test for log record structure
    - **Property 14: Log Kaydı Yapısı**
    - File: `apps/api/src/lib/__tests__/logger.test.ts`
    - Use `fc.string()` and `fc.record(...)` — every emitted JSON record must contain `timestamp`, `level`, `service`, `message`
    - **Validates: Requirements 20.1, 20.2**

- [ ] 3. Security — Telegram lib, auth middleware, and auth routes
  - [ ] 3.1 Update `apps/api/src/lib/telegram.ts` — auth_date replay protection
    - Export `getAuthDateFromInitData(initData: string): number | null`
    - Add `maxAgeSeconds = 300` parameter to `verifyTelegramInitData`
    - Inside the function: parse `auth_date`, compare with `Date.now() / 1000`, return `false` if expired or missing
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 3.2 Write property test for auth_date replay protection
    - **Property 1: Auth Date Replay Koruması**
    - File: `apps/api/src/lib/__tests__/telegram.test.ts`
    - Use `fc.integer({ min: 0, max: 1000 })` for age in seconds — age > 300 must return false, age ≤ 300 must return true (given valid hash)
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [ ] 3.3 Update `apps/api/src/middlewares/authMiddleware.ts` — remove x-telegram-user-id
    - Delete the `directTelegramId` block from `resolveTelegramHeaderUser`
    - Replace `console.error` with `logger.error`
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 3.4 Update `apps/api/src/routes/auth.routes.ts` — preview mode guard
    - At the top of the `/preview` handler check `env.ENABLE_PREVIEW_MODE !== 'true'` and return `403`
    - Replace any `console` calls with `logger`
    - _Requirements: 11.1, 11.2, 11.3_

- [ ] 4. Security — anti-cheat crypto nonce
  - [ ] 4.1 Update `apps/api/src/lib/antiCheat.ts`
    - Add `export function generateTapNonce(): number` using `crypto.randomInt(0, 2_147_483_647)`
    - _Requirements: 6.1, 6.4_

  - [ ]* 4.2 Write property tests for tap nonce
    - **Property 4: Tap Nonce Benzersizliği** — consecutive `generateTapNonce()` calls must return different values
    - **Property 5: Tap Nonce Aralık Garantisi** — every returned value must be in `[0, 2147483647]`
    - **Property 6: Yanlış Nonce Reddi** — `assertTapAllowed` with mismatched `clientNonce` must throw `AntiCheatError`
    - File: `apps/api/src/lib/__tests__/antiCheat.test.ts`
    - Use `fc.array(fc.integer({ min: 1, max: 50 }))`, `fc.nat()`, `fc.integer()`
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

  - [ ] 4.3 Update `apps/api/src/services/game.service.ts` — use crypto nonce
    - Import `generateTapNonce` from `../lib/antiCheat`
    - In the `tapUser` transaction replace `tapNonce: { increment: 1 }` with `tapNonce: generateTapNonce()`
    - Change `getActiveTapMultiplier()` and `getActiveChestLuckMultiplier()` calls to `await` (they become async in task 7)
    - Replace `console.error` with `logger.error`
    - _Requirements: 6.1, 6.3, 6.4, 12.1, 12.2_

- [ ] 5. Checkpoint — ensure all tests pass, ask the user if questions arise.

- [ ] 6. Security — CORS, rate limiting, and header hardening in index.ts
  - [ ] 6.1 Update `apps/api/src/index.ts` — CORS whitelist
    - Replace `app.use(cors())` with origin-whitelist cors using `ALLOWED_ORIGINS` env var (fallback to `MINIAPP_URL`)
    - Exempt `/webhooks/telegram` from CORS
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 6.2 Write property test for CORS origin filter
    - **Property 2: CORS Origin Filtresi**
    - File: `apps/api/src/__tests__/cors.test.ts`
    - Use `fc.webUrl()` — origins not in the whitelist must be rejected; listed origins must be accepted
    - **Validates: Requirements 2.1, 2.2**

  - [ ] 6.3 Update `apps/api/src/index.ts` — rate limiters
    - Install and configure three `express-rate-limit` limiters: `authLimiter` (20/10min/IP), `tapLimiter` (60/min/userId), `generalLimiter` (100/min/IP)
    - Apply `authLimiter` to `/auth` router, `tapLimiter` to `/game/tap` and `/api/game/tap`, `generalLimiter` to all other routes
    - Exempt `/health` and `/webhooks/telegram` from all limiters
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 6.4 Update `apps/api/src/index.ts` — health check with DB probe
    - Replace the synchronous `/health` handler with an async one that calls `prisma.$queryRaw\`SELECT 1\`` with a 3-second timeout
    - Return `{ ok: true, db: 'connected', ... }` on success, `503` with `{ ok: false, db: 'disconnected', error }` on failure
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [ ] 6.5 Replace all `console.log` / `console.error` in `apps/api/src/index.ts` with `logger`
    - _Requirements: 20.3_

- [ ] 7. Game integrity — live event multiplier from DB
  - [ ] 7.1 Update `apps/api/src/services/liveOpsAdmin.service.ts`
    - Remove the in-memory `liveEvents` array
    - Make `getPublicLiveEvents()` async — query `prisma.liveEventConfig.findMany({ where: { isEnabled: true, endsAt: { gt: now } } })`
    - Make `getActiveTapMultiplier()` and `getActiveChestLuckMultiplier()` async — parse `modifiersJson` from DB rows
    - Keep `startLiveEvent` / `stopLiveEvent` writing to DB instead of in-memory array
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ]* 7.2 Write property test for live event multiplier neutral state
    - **Property 8: Live Event Multiplier Nötr Durum**
    - File: `apps/api/src/services/__tests__/liveOpsAdmin.test.ts`
    - Use `fc.array(fc.record({ isEnabled: fc.boolean(), endsAt: fc.date() }))` — empty or expired event list must yield multiplier `1.0`
    - **Validates: Requirements 12.3**

- [ ] 8. Game integrity — idempotency middleware wiring
  - [ ] 8.1 Update `apps/api/src/routes/game.routes.ts`
    - Import `idempotencyMiddleware` and apply `idempotencyMiddleware('game_tap')` to the `/tap` route
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 8.2 Update `apps/api/src/routes/income.routes.ts`
    - Import `idempotencyMiddleware` and apply `idempotencyMiddleware('income_claim')` to the `/claim` route
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 8.3 Update `apps/api/src/routes/payment.routes.ts`
    - Import `idempotencyMiddleware` and apply `idempotencyMiddleware('payment_boost')` to the `/premium/boost/create` route
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 8.4 Write property test for idempotency replay
    - **Property 7: Idempotency Tekrar Yanıt**
    - File: `apps/api/src/middlewares/__tests__/idempotency.test.ts`
    - Use `fc.string({ minLength: 1 })` for key values — second request with same key must return identical response body
    - **Validates: Requirements 8.2**

- [ ] 9. Infrastructure — webhook handler and bot webhook mode
  - [ ] 9.1 Update `apps/api/src/routes/webhook.routes.ts`
    - Add `X-Telegram-Bot-Api-Secret-Token` header validation at the top of the handler (return `401` if mismatch)
    - Add `pre_checkout_query` handler: call `bot.telegram.answerPreCheckoutQuery(id, true)`
    - Log each webhook event with `logger`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 9.2 Update `apps/bot/src/index.ts` — webhook mode
    - Check `NODE_ENV === 'production'`; if true, call `bot.telegram.setWebhook(WEBHOOK_URL, { secret_token: WEBHOOK_SECRET })` and use Telegraf's Express middleware to handle incoming requests
    - Keep `bot.launch()` for development
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 10. Infrastructure — notification worker and analytics daily job
  - [ ] 10.1 Update `apps/api/src/workers/notification.worker.ts`
    - Add `telegramId: { not: { startsWith: 'preview_' } }` to the `findMany` where clause
    - On `sendTelegramMessage` failure update `NotificationLog` to `status: 'failed'` and log with `logger.error`
    - Replace `console.error` with `logger.error`
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [ ]* 10.2 Write property tests for notification worker
    - **Property 9: Notification Preview Filtresi** — users with `telegramId` starting with `preview_` must never receive notifications
    - **Property 10: Notification Cooldown** — same user + type within 12 hours must not trigger a second send
    - File: `apps/api/src/workers/__tests__/notification.test.ts`
    - Use `fc.array(fc.record({ telegramId: fc.string() }))` and `fc.record({ userId: fc.string(), type: fc.string() })`
    - **Validates: Requirements 13.1, 13.4**

  - [ ] 10.3 Create `apps/api/src/workers/analyticsDaily.worker.ts`
    - Implement `runAnalyticsDailyJob()`: compute `yesterday` / `today` UTC boundaries, run four parallel Prisma queries (DAU, newUsers, totalTaps, revenue), upsert into `AnalyticsDaily`
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [ ] 10.4 Wire analytics cron in `apps/api/src/index.ts`
    - Import `runAnalyticsDailyJob` and schedule it with `setInterval` to fire daily at UTC 00:05 (compute ms until next 00:05 for initial delay)
    - _Requirements: 14.1_

- [ ] 11. Checkpoint — ensure all tests pass, ask the user if questions arise.

- [ ] 12. Database — schema indexes and soft delete
  - [ ] 12.1 Update `apps/api/prisma/schema.prisma`
    - Add `deletedAt DateTime?` field to `User` model
    - Add `@@index([username])` to `User` model
    - Add `@@index([userId, entryType, createdAt])` to `WalletLedgerEntry` model
    - Replace `@@index([userId, status])` with `@@index([userId, status, createdAt])` in `Payment` model
    - Add `@@index([userId, status, createdAt])` to `NotificationLog` model
    - _Requirements: 16.1, 16.3, 16.4, 16.5, 17.1_

  - [ ]* 12.2 Write property test for soft delete visibility
    - **Property 11: Soft Delete Görünmezliği**
    - File: `apps/api/src/__tests__/softDelete.test.ts`
    - Use `fc.record({ id: fc.string() })` — users with `deletedAt` set must not appear in queries filtered by `deletedAt: null`
    - **Validates: Requirements 17.1, 17.4**

- [ ] 13. Frontend — sessionStorage token and FingerprintJS
  - [ ] 13.1 Update `apps/web/src/hooks/useAuth.ts` — sessionStorage
    - Replace all `localStorage.setItem('adn_airdrop_token', ...)` with `sessionStorage.setItem`
    - Replace all `localStorage.getItem('adn_airdrop_token')` with `sessionStorage.getItem`
    - Keep `adn_preview_id` in `localStorage`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 13.2 Update `apps/web/src/hooks/useAuth.ts` — FingerprintJS
    - Import `FingerprintJS` from `@fingerprintjs/fingerprintjs`
    - Initialize `const fpPromise = FingerprintJS.load()` at module level
    - Replace the synchronous `getFingerprint()` with an async version that awaits `fpPromise` and falls back to the existing hash on error
    - _Requirements: 19.1, 19.2, 19.3, 19.4_

  - [ ] 13.3 Update `apps/web/src/lib/api.ts` — retry logic
    - Add `sleep(ms)` helper
    - Add `fetchWithRetry(input, init, retries = 3)` that retries on `503` / network errors with delays `[500, 1000, 2000]`
    - On `401` throw `UnauthorizedError` immediately without retrying
    - Update `postJSON` and `getJSON` to use `fetchWithRetry`
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

  - [ ]* 13.4 Write property tests for retry logic
    - **Property 12: Retry Sayısı Sınırı** — a permanently failing endpoint must be retried at most 3 times
    - **Property 13: Exponential Backoff Sırası** — delays must be exactly 500ms, 1000ms, 2000ms in order
    - File: `apps/web/src/lib/__tests__/api.test.ts`
    - Use `fc.integer({ min: 1, max: 10 })` and `fc.integer({ min: 0, max: 2 })`
    - **Validates: Requirements 18.1, 18.2**

- [ ] 14. Replace remaining console calls with logger across API
  - Update all `console.error` / `console.log` in services and workers not already covered by previous tasks
  - Files: `apps/api/src/services/game.service.ts`, `apps/api/src/workers/notification.worker.ts`, any other service files that still use `console`
  - _Requirements: 20.3_

- [ ] 15. Final checkpoint — ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with minimum 100 iterations per property
- Unit tests and property tests are complementary — both should be run
- After task 12.1, run `npx prisma migrate dev` to apply schema changes
