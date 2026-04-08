# Design Document: Production-Ready Upgrade

## Overview

ADN Token, Telegram Mini App üzerinde çalışan bir tap-to-earn oyunudur (monorepo: `apps/api`, `apps/web`, `apps/bot`). Bu tasarım dokümanı, projeyi production ortamına hazır hale getirmek için gereken 21 gereksinimi teknik olarak ele alır.

Değişiklikler dört ana kategoriye ayrılır:
- **Güvenlik**: Replay attack koruması, CORS kısıtlaması, rate limiting, JWT güvenliği, header güvenliği, preview mode kısıtlaması
- **Oyun Bütünlüğü**: Anti-cheat nonce, idempotency entegrasyonu, live event multiplier
- **Altyapı**: Bot webhook mode, health check, DB index, soft delete, pino logging, bağımlılıklar
- **Frontend**: Token storage, retry logic, FingerprintJS

---

## Architecture

```mermaid
graph TB
    subgraph "apps/web (React + Vite)"
        WA[useAuth.ts] -->|sessionStorage| WT[Token Store]
        WA -->|FingerprintJS| WF[Device Fingerprint]
        WL[api.ts] -->|Retry + Backoff| API
    end

    subgraph "apps/bot (Telegraf)"
        BA[index.ts] -->|NODE_ENV=prod| BW[Webhook Mode]
        BA -->|NODE_ENV=dev| BP[Polling Mode]
    end

    subgraph "apps/api (Express + Prisma)"
        RL[Rate Limiter] --> CORS[CORS Middleware]
        CORS --> AUTH[authMiddleware.ts]
        AUTH --> ROUTES[Routes]
        ROUTES --> IDEM[idempotency.middleware.ts]
        IDEM --> SVC[Services]
        SVC --> DB[(PostgreSQL)]
        WH[webhook.routes.ts] --> PS[payment.service.ts]
        HC[/health] --> DB
        NW[notification.worker.ts] --> TG[Telegram API]
        CJ[Analytics Cron Job] --> DB
    end

    API --> apps/api
```

---

## Components and Interfaces

### 1. `apps/api/src/lib/telegram.ts` — Auth Date Kontrolü

Mevcut `verifyTelegramInitData` fonksiyonuna `auth_date` timestamp kontrolü eklenir.

```typescript
// Yeni export: auth_date parse ve validasyon
export function getAuthDateFromInitData(initData: string): number | null

// Değişen imza: maxAgeSeconds parametresi eklenir
export function verifyTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds?: number  // default: 300
): boolean
```

`verifyTelegramInitData` içinde:
1. `params.get('auth_date')` ile timestamp alınır
2. `Date.now() / 1000 - authDate > maxAgeSeconds` kontrolü yapılır
3. Başarısız olursa `false` döner

### 2. `apps/api/src/index.ts` — CORS + Rate Limiting

**CORS**: `cors()` çağrısı, `ALLOWED_ORIGINS` env var'ına göre origin whitelist ile değiştirilir. `/webhooks/telegram` endpoint'i CORS'tan muaf tutulur.

**Rate Limiting**: `express-rate-limit` ile üç farklı limiter tanımlanır:

```typescript
// Auth limiter: 10 dakikada 20 istek / IP
const authLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20 })

// Tap limiter: 1 dakikada 60 istek / kullanıcı (keyGenerator: req.user?.id)
const tapLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, keyGenerator })

// Genel limiter: 1 dakikada 100 istek / IP
const generalLimiter = rateLimit({ windowMs: 60 * 1000, max: 100 })
```

`/health` ve `/webhooks/telegram` rate limiting'den muaf tutulur.

### 3. `apps/api/src/lib/env.ts` — JWT Secret Validasyonu

```typescript
JWT_SECRET: z.string().min(32, 'JWT_SECRET en az 32 karakter olmalidir'),
ALLOWED_ORIGINS: z.string().optional(),
ENABLE_PREVIEW_MODE: z.string().optional(),
NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
LOG_LEVEL: z.string().default('info'),
```

### 4. `apps/web/src/hooks/useAuth.ts` — SessionStorage

`localStorage.setItem('adn_airdrop_token', ...)` → `sessionStorage.setItem('adn_airdrop_token', ...)`
`localStorage.getItem('adn_airdrop_token')` → `sessionStorage.getItem('adn_airdrop_token')`

`adn_preview_id` localStorage'da kalmaya devam eder.

### 5. `apps/api/src/lib/antiCheat.ts` + `apps/api/src/services/game.service.ts` — Crypto Nonce

`antiCheat.ts`'e yeni fonksiyon eklenir:
```typescript
export function generateTapNonce(): number {
  return crypto.randomInt(0, 2_147_483_647)
}
```

`game.service.ts`'deki `tapUser` transaction'ında:
```typescript
tapNonce: generateTapNonce()  // { increment: 1 } yerine
```

### 6. `apps/api/src/middlewares/authMiddleware.ts` — Header Güvenliği

`resolveTelegramHeaderUser` fonksiyonundan `x-telegram-user-id` bloğu kaldırılır:
```typescript
// KALDIRILACAK:
const directTelegramId = req.header('x-telegram-user-id');
if (directTelegramId) {
  return prisma.user.findUnique({ where: { telegramId: directTelegramId } });
}
```

### 7. Route Dosyaları — Idempotency Middleware

- `apps/api/src/routes/game.routes.ts`: `/tap` route'una `idempotencyMiddleware('game_tap')` eklenir
- `apps/api/src/routes/income.routes.ts`: `/claim` route'una `idempotencyMiddleware('income_claim')` eklenir
- `apps/api/src/routes/payment.routes.ts`: `/premium/boost/create` route'una `idempotencyMiddleware('payment_boost')` eklenir
- `apps/api/src/routes/daily.routes.ts`: Zaten mevcut (`idempotencyMiddleware('daily_claim')`)

### 8. `apps/api/src/routes/webhook.routes.ts` — Telegram Stars Handler

`pre_checkout_query` event'i eklenir, `X-Telegram-Bot-Api-Secret-Token` header doğrulaması eklenir:

```typescript
// Secret token doğrulama
const secretToken = req.header('x-telegram-bot-api-secret-token')
if (env.WEBHOOK_SECRET && secretToken !== env.WEBHOOK_SECRET) {
  return res.status(401).json({ ok: false })
}

// pre_checkout_query handler
const preCheckout = req.body?.pre_checkout_query
if (preCheckout?.id) {
  await bot.telegram.answerPreCheckoutQuery(preCheckout.id, true)
}
```

### 9. `apps/bot/src/index.ts` — Webhook Mode

```typescript
const NODE_ENV = process.env.NODE_ENV || 'development'

if (NODE_ENV === 'production') {
  const webhookUrl = requireEnv('WEBHOOK_URL')
  const secretToken = process.env.WEBHOOK_SECRET
  await bot.telegram.setWebhook(webhookUrl, { secret_token: secretToken })
  // Express middleware ile webhook isteklerini işle
} else {
  await bot.launch()
}
```

### 10. `apps/api/src/routes/auth.routes.ts` — Preview Mode Güvenliği

```typescript
router.post('/preview', async (req, res) => {
  const isPreviewEnabled = env.ENABLE_PREVIEW_MODE === 'true'
  if (!isPreviewEnabled) {
    return res.status(403).json({ message: 'Preview mode devre disi' })
  }
  // ...mevcut kod
})
```

### 11. `apps/api/src/services/liveOpsAdmin.service.ts` — DB'den Okuma

Mevcut in-memory `liveEvents` dizisi kaldırılır. `getLiveEvents()`, `getPublicLiveEvents()`, `getActiveTapMultiplier()`, `getActiveChestLuckMultiplier()` fonksiyonları `prisma.liveEventConfig.findMany()` ile DB'den okuyacak şekilde güncellenir:

```typescript
export async function getPublicLiveEvents() {
  const now = new Date()
  return prisma.liveEventConfig.findMany({
    where: { isEnabled: true, endsAt: { gt: now } }
  })
}

export async function getActiveTapMultiplier(): Promise<number> {
  const events = await getPublicLiveEvents()
  let multiplier = 1
  for (const event of events) {
    const mods = JSON.parse(event.modifiersJson) as Record<string, number>
    if (mods.tapMultiplier) multiplier = Math.max(multiplier, mods.tapMultiplier)
  }
  return multiplier
}
```

`game.service.ts`'deki `getActiveTapMultiplier()` ve `getActiveChestLuckMultiplier()` çağrıları `await` ile güncellenir.

### 12. `apps/api/src/workers/notification.worker.ts` — Tam Implementasyon

Mevcut worker zaten büyük ölçüde implement edilmiş. Eksik kısımlar:
- `sendTelegramMessage` fonksiyonu `NotificationLog` kaydını `failed` olarak güncellemeli
- `runNotificationWorker` preview kullanıcıları filtrelemeli (`telegramId NOT LIKE 'preview_%'`)

```typescript
// where filtresine eklenir:
where: {
  isBanned: false,
  telegramId: { not: { startsWith: 'preview_' } }
}
```

### 13. `apps/api/src/workers/analyticsDaily.worker.ts` — Yeni Dosya

```typescript
export async function runAnalyticsDailyJob() {
  const yesterday = startOfYesterday() // UTC 00:00
  const today = startOfToday()

  const [dau, newUsers, totalTaps, revenue] = await Promise.all([
    prisma.user.count({ where: { lastSeenAt: { gte: yesterday, lt: today } } }),
    prisma.user.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
    prisma.walletLedgerEntry.count({ where: { entryType: 'tap_reward', createdAt: { gte: yesterday, lt: today } } }),
    prisma.payment.aggregate({ where: { status: 'paid', createdAt: { gte: yesterday, lt: today } }, _sum: { amount: true } })
  ])

  await prisma.analyticsDaily.upsert({
    where: { day: yesterday },
    update: { dau, newUsers, totalTaps, totalRevenueXtr: revenue._sum.amount ?? 0 },
    create: { day: yesterday, dau, newUsers, totalTaps, totalRevenueXtr: revenue._sum.amount ?? 0 }
  })
}
```

`index.ts`'de cron: `setInterval` ile her gün UTC 00:05'te çalıştırılır (veya `node-cron` paketi kullanılır).

### 14. `apps/api/src/index.ts` — Health Check DB Testi

```typescript
app.get('/health', async (_req, res) => {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
    ])
    res.json({ ok: true, db: 'connected', service: 'telegram-miniapp-api', time: new Date().toISOString() })
  } catch (error) {
    res.status(503).json({ ok: false, db: 'disconnected', error: String(error) })
  }
})
```

### 15. `apps/api/prisma/schema.prisma` — Index ve Soft Delete

**Yeni index'ler:**
```prisma
model User {
  // ...
  deletedAt DateTime?  // soft delete
  @@index([username])
}

model WalletLedgerEntry {
  // ...
  @@index([userId, entryType, createdAt])  // mevcut @@index([userId, createdAt]) korunur
}

model Payment {
  // ...
  @@index([userId, status, createdAt])  // mevcut @@index([userId, status]) genişletilir
}

model NotificationLog {
  // ...
  @@index([userId, status, createdAt])  // mevcut @@index([status, createdAt]) korunur
}
```

### 16. `apps/web/src/lib/api.ts` — Retry Logic

```typescript
async function fetchWithRetry(input: string, init: RequestInit, retries = 3): Promise<Response> {
  const delays = [500, 1000, 2000]
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetchWithTimeout(input, init)
    if (response.status === 401) throw new UnauthorizedError()
    if (response.ok || attempt === retries) return response
    if (response.status === 503 || response.status >= 500) {
      await sleep(delays[attempt])
      continue
    }
    return response
  }
}
```

### 17. `apps/web/src/hooks/useAuth.ts` — FingerprintJS

```typescript
import FingerprintJS from '@fingerprintjs/fingerprintjs'

// Uygulama başlangıcında async olarak başlatılır
const fpPromise = FingerprintJS.load()

async function getFingerprint(): Promise<string> {
  try {
    const fp = await fpPromise
    const result = await fp.get()
    return result.visitorId
  } catch {
    return getSimpleFingerprint() // mevcut fallback
  }
}
```

### 18. `apps/api/src/lib/logger.ts` — Pino Logger

```typescript
import pino from 'pino'
import { env } from './env'

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'telegram-miniapp-api' },
  transport: env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined
})
```

---

## Data Models

### User Model Değişiklikleri

```prisma
model User {
  // Mevcut alanlar korunur
  deletedAt DateTime?  // YENİ: soft delete için

  @@index([username])  // YENİ: username aramaları için
}
```

### WalletLedgerEntry Index Değişikliği

```prisma
@@index([userId, entryType, createdAt])  // YENİ: analytics sorguları için
```

### Payment Index Değişikliği

```prisma
@@index([userId, status, createdAt])  // GENİŞLETİLDİ: createdAt eklendi
```

### NotificationLog Index Değişikliği

```prisma
@@index([userId, status, createdAt])  // YENİ: kullanıcı bazlı durum sorguları için
```

### Env Değişkenleri

| Değişken | Tip | Açıklama |
|---|---|---|
| `JWT_SECRET` | `string (min 32)` | JWT imzalama anahtarı |
| `ALLOWED_ORIGINS` | `string?` | Virgülle ayrılmış izin verilen origin'ler |
| `ENABLE_PREVIEW_MODE` | `string?` | `'true'` ise preview endpoint aktif |
| `NODE_ENV` | `development\|production\|test` | Ortam |
| `LOG_LEVEL` | `string` | Pino log seviyesi (default: `info`) |
| `WEBHOOK_SECRET` | `string?` | Telegram webhook doğrulama token'ı |
| `WEBHOOK_URL` | `string?` | Bot webhook URL'i (production'da zorunlu) |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Auth Date Replay Koruması

*For any* init data string'i için, `auth_date` değeri mevcut Unix timestamp'ten 300 saniyeden daha eski ise `verifyTelegramInitData` `false` döndürmeli; 300 saniye veya daha yeni ise (diğer koşullar sağlandığında) `true` döndürmelidir.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: CORS Origin Filtresi

*For any* origin string'i, `ALLOWED_ORIGINS` listesinde yer almayan origin'lerden gelen istekler CORS middleware tarafından reddedilmeli; listede yer alanlar kabul edilmelidir.

**Validates: Requirements 2.1, 2.2**

### Property 3: JWT Secret Uzunluk Validasyonu

*For any* string değeri için, 32 karakterden kısa olanlar `env.ts` Zod şeması tarafından reddedilmeli; 32 karakter ve üzeri olanlar kabul edilmelidir.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 4: Tap Nonce Benzersizliği

*For any* tap işlemi dizisi için, her tap sonrası dönen `tapNonce` değeri bir önceki `tapNonce` değerinden farklı olmalıdır.

**Validates: Requirements 6.1, 6.3**

### Property 5: Tap Nonce Aralık Garantisi

*For any* `generateTapNonce()` çağrısı için, dönen değer `[0, 2147483647]` aralığında olmalıdır.

**Validates: Requirements 6.4**

### Property 6: Yanlış Nonce Reddi

*For any* geçersiz (mevcut `tapNonce`'dan farklı) `clientNonce` değeri için, tap isteği `AntiCheatError` ile reddedilmelidir.

**Validates: Requirements 6.2**

### Property 7: Idempotency Tekrar Yanıt

*For any* `x-idempotency-key` değeri için, aynı key ile yapılan ikinci istek ilk isteğin yanıtıyla birebir aynı olmalıdır.

**Validates: Requirements 8.2**

### Property 8: Live Event Multiplier Nötr Durum

*For any* boş veya süresi dolmuş event listesi için, `getActiveTapMultiplier()` ve `getActiveChestLuckMultiplier()` her zaman `1.0` döndürmelidir.

**Validates: Requirements 12.3**

### Property 9: Notification Preview Filtresi

*For any* kullanıcı listesi için, `telegramId` alanı `preview_` ile başlayan kullanıcılara bildirim gönderilmemelidir.

**Validates: Requirements 13.1**

### Property 10: Notification Cooldown

*For any* kullanıcı ve bildirim tipi kombinasyonu için, son 12 saat içinde aynı tipte bildirim gönderilmişse yeni bildirim gönderilmemelidir.

**Validates: Requirements 13.4**

### Property 11: Soft Delete Görünmezliği

*For any* `deletedAt` alanı dolu olan kullanıcı için, `deletedAt: null` filtresi içeren sorgular bu kullanıcıyı döndürmemelidir.

**Validates: Requirements 17.1, 17.4**

### Property 12: Retry Sayısı Sınırı

*For any* sürekli hata döndüren endpoint için, `fetchWithRetry` en fazla 3 deneme yapmalı ve 3 denemeden sonra hata fırlatmalıdır.

**Validates: Requirements 18.1**

### Property 13: Exponential Backoff Sırası

*For any* retry dizisi için, bekleme süreleri sırasıyla 500ms, 1000ms, 2000ms olmalıdır (her deneme bir öncekinin 2 katı).

**Validates: Requirements 18.2**

### Property 14: Log Kaydı Yapısı

*For any* log çağrısı için, üretilen JSON kaydı `timestamp`, `level`, `service` ve `message` alanlarını içermelidir.

**Validates: Requirements 20.1, 20.2**

---

## Error Handling

### Auth Hataları

| Durum | HTTP Kodu | Mesaj |
|---|---|---|
| `auth_date` süresi dolmuş | 401 | `'Telegram giris verisi suresi dolmus'` |
| `auth_date` eksik | 401 | `'Telegram giris verisi gecersiz'` |
| `x-telegram-user-id` header'ı | 401 | `'Yetkisiz istek'` (header yok sayılır) |
| Preview mode kapalı | 403 | `'Preview mode devre disi'` |

### Rate Limit Hataları

`express-rate-limit` varsayılan olarak `429 Too Many Requests` ve `Retry-After` header'ı döndürür. Özel mesaj:
```json
{ "message": "Cok fazla istek. Lutfen bekleyin." }
```

### Webhook Hataları

| Durum | HTTP Kodu |
|---|---|
| Geçersiz `X-Telegram-Bot-Api-Secret-Token` | 401 |
| `pre_checkout_query` işleme hatası | 500 (Telegram'a `ok: false` gönderilir) |

### Health Check Hataları

DB bağlantısı 3 saniye içinde yanıt vermezse `503 Service Unavailable` döner. Load balancer bu durumda instance'ı devre dışı bırakabilir.

### Retry Logic Hataları

- `401`: Retry yapılmaz, `UnauthorizedError` fırlatılır, oturum sonlandırılır
- `503` / ağ hatası: 3 retry, exponential backoff
- 3 retry sonrası başarısız: `'Sunucu yanit vermedi. Lutfen tekrar dene.'` mesajı

---

## Testing Strategy

### Dual Testing Approach

Unit testler belirli örnekleri ve edge case'leri kapsar; property testler evrensel özellikleri tüm input uzayında doğrular.

### Property-Based Testing

**Kütüphane**: `fast-check` (TypeScript native, Jest/Vitest ile uyumlu)

**Konfigürasyon**: Her property testi minimum 100 iterasyon çalıştırır.

**Tag formatı**: `// Feature: production-ready-upgrade, Property N: <property_text>`

Property testleri şu dosyalarda implement edilir:

| Property | Test Dosyası | fast-check Arbitrary |
|---|---|---|
| P1: Auth Date | `apps/api/src/lib/__tests__/telegram.test.ts` | `fc.integer({ min: 0, max: 1000 })` (saniye cinsinden yaş) |
| P2: CORS Filter | `apps/api/src/__tests__/cors.test.ts` | `fc.webUrl()` |
| P3: JWT Length | `apps/api/src/lib/__tests__/env.test.ts` | `fc.string({ minLength: 1, maxLength: 100 })` |
| P4: Nonce Uniqueness | `apps/api/src/lib/__tests__/antiCheat.test.ts` | `fc.array(fc.integer({ min: 1, max: 50 }))` |
| P5: Nonce Range | `apps/api/src/lib/__tests__/antiCheat.test.ts` | `fc.nat()` |
| P6: Wrong Nonce | `apps/api/src/lib/__tests__/antiCheat.test.ts` | `fc.integer()` |
| P7: Idempotency | `apps/api/src/middlewares/__tests__/idempotency.test.ts` | `fc.string({ minLength: 1 })` |
| P8: Event Multiplier | `apps/api/src/services/__tests__/liveOpsAdmin.test.ts` | `fc.array(fc.record(...))` |
| P9: Notification Filter | `apps/api/src/workers/__tests__/notification.test.ts` | `fc.array(fc.record({ telegramId: fc.string() }))` |
| P10: Notification Cooldown | `apps/api/src/workers/__tests__/notification.test.ts` | `fc.record({ userId: fc.string(), type: fc.string() })` |
| P11: Soft Delete | `apps/api/src/__tests__/softDelete.test.ts` | `fc.record({ id: fc.string() })` |
| P12: Retry Count | `apps/web/src/lib/__tests__/api.test.ts` | `fc.integer({ min: 1, max: 10 })` (hata sayısı) |
| P13: Backoff Timing | `apps/web/src/lib/__tests__/api.test.ts` | `fc.integer({ min: 0, max: 2 })` (retry index) |
| P14: Log Structure | `apps/api/src/lib/__tests__/logger.test.ts` | `fc.string()`, `fc.record(...)` |

### Unit Testler

- `authMiddleware.test.ts`: `x-telegram-user-id` header'ının yok sayıldığını doğrula
- `webhook.routes.test.ts`: `pre_checkout_query` ve `successful_payment` event'lerini doğrula
- `auth.routes.test.ts`: Preview mode kapalıyken 403 döndüğünü doğrula
- `useAuth.test.ts`: Token'ın sessionStorage'a yazıldığını doğrula

### Integration Testler

- Health check: DB bağlı/bağlı değil senaryoları
- Analytics daily job: Bilinen verilerle doğru aggregation
- Live event multiplier: DB'deki aktif event'in tap hesaplamasına yansıması
- Bot webhook mode: `NODE_ENV=production` ile webhook'un set edilmesi
