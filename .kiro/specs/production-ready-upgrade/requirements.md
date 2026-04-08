"           # Requirements Document

## Introduction

ADN Token, Telegram Mini App üzerinde çalışan bir tap-to-earn oyun projesidir (monorepo: apps/api, apps/web, apps/bot). Proje mevcut haliyle çalışmakta ancak production ortamına alınmadan önce kritik güvenlik açıkları kapatılmalı, eksik özellikler tamamlanmalı, veritabanı optimizasyonları yapılmalı ve bağımlılıklar güncellenmelidir. Bu doküman, projeyi production-ready hale getirmek için gereken tüm gereksinimleri tanımlar.

## Glossary

- **API**: `apps/api` — Express.js + Prisma + PostgreSQL backend servisi
- **Web**: `apps/web` — React + Vite Telegram Mini App frontend
- **Bot**: `apps/bot` — Telegraf tabanlı Telegram bot servisi
- **Auth_Middleware**: `apps/api/src/middlewares/authMiddleware.ts` — JWT ve Telegram init data doğrulama katmanı
- **Telegram_Lib**: `apps/api/src/lib/telegram.ts` — Telegram init data doğrulama yardımcı fonksiyonları
- **Anti_Cheat**: `apps/api/src/lib/antiCheat.ts` ve `advancedAntiCheat.service.ts` — Hile önleme sistemi
- **Idempotency_Middleware**: `apps/api/src/middlewares/idempotency.middleware.ts` — Tekrar eden istek koruması
- **Payment_Service**: `apps/api/src/services/payment.service.ts` — Telegram Stars ödeme servisi
- **Webhook_Handler**: `apps/api/src/routes/webhook.routes.ts` — Telegram bot webhook alıcısı
- **Notification_Worker**: `apps/api/src/workers/notification.worker.ts` — Push bildirim işçisi
- **Analytics_Daily**: Prisma şemasındaki `AnalyticsDaily` modeli — Günlük analitik özeti
- **Live_Event**: `LiveEventConfig` modeli ve `liveOpsAdmin.service.ts` — Canlı etkinlik sistemi
- **Rate_Limiter**: express-rate-limit tabanlı istek sınırlama katmanı
- **Logger**: Yapılandırılmış log sistemi (pino veya winston)
- **Fingerprint_Service**: `@fingerprintjs/fingerprintjs` tabanlı gelişmiş cihaz parmak izi servisi
- **Preview_Mode**: Telegram dışı ortamlarda test için kullanılan `/auth/preview` endpoint'i
- **Replay_Attack**: Eski bir auth_date değeri içeren init data'nın yeniden kullanılması saldırısı

---

## Requirements

### Requirement 1: Telegram Init Data Replay Attack Koruması

**User Story:** Bir güvenlik mühendisi olarak, eski Telegram init data token'larının yeniden kullanılmasını engellemek istiyorum; böylece replay attack ile yetkisiz erişim sağlanamaz.

#### Acceptance Criteria

1. WHEN bir `/auth/telegram` isteği geldiğinde, THE Telegram_Lib SHALL init data içindeki `auth_date` alanını Unix timestamp olarak parse etmeli ve mevcut zamanla karşılaştırmalıdır.
2. IF `auth_date` değeri mevcut Unix timestamp'ten 300 saniyeden (5 dakika) daha eski ise, THEN THE Auth_Middleware SHALL `401 Unauthorized` döndürmeli ve isteği reddetmelidir.
3. THE Telegram_Lib SHALL `auth_date` alanı eksik olan init data'yı geçersiz saymalıdır.
4. WHEN `auth_date` kontrolü başarısız olduğunda, THE API SHALL log kaydı oluşturmalı ve `{ message: 'Telegram giris verisi suresi dolmus' }` yanıtı döndürmelidir.

---

### Requirement 2: CORS Kısıtlaması

**User Story:** Bir güvenlik mühendisi olarak, API'ye yalnızca yetkili origin'lerden erişilmesini istiyorum; böylece yetkisiz cross-origin istekler engellenir.

#### Acceptance Criteria

1. THE API SHALL CORS politikasını yalnızca `ALLOWED_ORIGINS` ortam değişkeninde tanımlı origin'lere izin verecek şekilde yapılandırmalıdır.
2. WHEN bir istek izin verilmeyen bir origin'den geldiğinde, THE API SHALL `403 Forbidden` yanıtı döndürmelidir.
3. WHERE `ALLOWED_ORIGINS` ortam değişkeni tanımlı değilse, THE API SHALL yalnızca `MINIAPP_URL` değerini izin verilen origin olarak kabul etmelidir.
4. THE API SHALL `/webhooks/telegram` endpoint'ini CORS politikasından muaf tutmalıdır; çünkü bu endpoint Telegram sunucularından gelen istekleri alır.

---

### Requirement 3: Rate Limiting

**User Story:** Bir sistem yöneticisi olarak, API endpoint'lerini brute force ve DDoS saldırılarına karşı korumak istiyorum; böylece servis sürekliliği sağlanır.

#### Acceptance Criteria

1. THE Rate_Limiter SHALL `/auth/*` endpoint'leri için IP başına 10 dakikada en fazla 20 istek kabul etmelidir.
2. THE Rate_Limiter SHALL `/game/tap` endpoint'i için kullanıcı başına dakikada en fazla 60 istek kabul etmelidir.
3. THE Rate_Limiter SHALL genel API endpoint'leri için IP başına dakikada en fazla 100 istek kabul etmelidir.
4. WHEN rate limit aşıldığında, THE Rate_Limiter SHALL `429 Too Many Requests` yanıtı ve `Retry-After` header'ı döndürmelidir.
5. THE Rate_Limiter SHALL `/health` ve `/webhooks/telegram` endpoint'lerini rate limiting'den muaf tutmalıdır.

---

### Requirement 4: JWT Secret Güvenliği

**User Story:** Bir güvenlik mühendisi olarak, JWT secret'ının yeterli uzunlukta ve entropi'de olmasını istiyorum; böylece brute force ile kırılması engellenir.

#### Acceptance Criteria

1. THE API SHALL başlangıçta `JWT_SECRET` ortam değişkeninin en az 32 karakter uzunluğunda olduğunu doğrulamalıdır.
2. IF `JWT_SECRET` 32 karakterden kısa ise, THEN THE API SHALL başlamayı reddetmeli ve açıklayıcı bir hata mesajı ile process'i sonlandırmalıdır.
3. THE API SHALL `env.ts` içindeki `JWT_SECRET` validasyonunu `.min(32)` olarak güncellenmelidir.

---

### Requirement 5: Frontend Token Güvenliği

**User Story:** Bir güvenlik mühendisi olarak, JWT token'ının XSS saldırılarına karşı daha güvenli bir şekilde saklanmasını istiyorum; böylece token çalınma riski azaltılır.

#### Acceptance Criteria

1. THE Web SHALL JWT token'ını `localStorage` yerine `sessionStorage`'da saklamalıdır.
2. WHEN kullanıcı oturumu kapattığında veya Telegram Mini App kapandığında, THE Web SHALL `sessionStorage`'daki token'ı temizlemelidir.
3. THE Web SHALL token'ı yalnızca API isteklerinde `Authorization: Bearer` header'ı olarak kullanmalıdır; DOM'a veya başka bir yere yazmamalıdır.
4. THE Web SHALL `adn_preview_id` değerini `localStorage`'da saklamaya devam edebilir; çünkü bu değer güvenlik açısından kritik değildir.

---

### Requirement 6: Anti-Cheat Nonce Güvenliği

**User Story:** Bir oyun güvenlik mühendisi olarak, tap nonce değerinin tahmin edilemez olmasını istiyorum; böylece sequential nonce ile yapılan replay saldırıları engellenir.

#### Acceptance Criteria

1. THE Anti_Cheat SHALL `tapNonce` değerini her tap işleminde kriptografik olarak güvenli rastgele bir değerle güncellenmelidir.
2. WHEN bir tap isteği geldiğinde, THE Anti_Cheat SHALL `clientNonce` değerinin veritabanındaki mevcut `tapNonce` ile eşleştiğini doğrulamalıdır.
3. THE API SHALL tap yanıtında bir sonraki `tapNonce` değerini döndürmelidir; böylece client bir sonraki isteği hazırlayabilir.
4. THE Anti_Cheat SHALL `tapNonce` değerini `crypto.randomInt(0, 2147483647)` ile üretmelidir.

---

### Requirement 7: x-telegram-user-id Header Güvenliği

**User Story:** Bir güvenlik mühendisi olarak, `x-telegram-user-id` header'ının doğrulamasız kabul edilmemesini istiyorum; böylece kimlik sahteciliği saldırıları engellenir.

#### Acceptance Criteria

1. THE Auth_Middleware SHALL `x-telegram-user-id` header'ını doğrudan kullanıcı kimliği olarak kabul etmemelidir.
2. THE Auth_Middleware SHALL yalnızca `Authorization: Bearer <JWT>` ve doğrulanmış `x-telegram-init-data` header'larını kimlik doğrulama yöntemi olarak kabul etmelidir.
3. WHEN `x-telegram-user-id` header'ı mevcut olduğunda, THE Auth_Middleware SHALL bu header'ı yok saymalı ve diğer doğrulama yöntemlerine geçmelidir.

---

### Requirement 8: Idempotency Middleware Entegrasyonu

**User Story:** Bir backend geliştirici olarak, kritik para işlemlerinin idempotency korumasına sahip olmasını istiyorum; böylece ağ hataları nedeniyle çift ödeme veya çift claim oluşmaz.

#### Acceptance Criteria

1. THE Idempotency_Middleware SHALL `/game/tap`, `/income/claim`, `/daily/claim` ve `/payments/premium/boost/create` route'larına uygulanmalıdır.
2. WHEN aynı `x-idempotency-key` header'ı ile tekrar istek geldiğinde, THE Idempotency_Middleware SHALL önceki yanıtı döndürmeli ve işlemi tekrar çalıştırmamalıdır.
3. THE Idempotency_Middleware SHALL `x-idempotency-key` header'ı olmayan istekleri normal şekilde işlemelidir.

---

### Requirement 9: Telegram Stars Webhook Handler

**User Story:** Bir ödeme sistemi geliştirici olarak, Telegram Stars ödemelerinin `pre_checkout_query` ve `successful_payment` event'lerini doğru şekilde işlemek istiyorum; böylece ödemeler güvenilir şekilde onaylanır.

#### Acceptance Criteria

1. WHEN Telegram bot webhook'u `pre_checkout_query` event'i aldığında, THE Webhook_Handler SHALL `answerPreCheckoutQuery` ile `ok: true` yanıtı döndürmelidir.
2. WHEN Telegram bot webhook'u `message.successful_payment` event'i aldığında, THE Webhook_Handler SHALL `applySuccessfulPremiumPayment` servisini çağırmalıdır.
3. THE Webhook_Handler SHALL webhook isteğinin Telegram'dan geldiğini doğrulamak için `X-Telegram-Bot-Api-Secret-Token` header'ını kontrol etmelidir.
4. IF webhook doğrulaması başarısız olursa, THEN THE Webhook_Handler SHALL `401 Unauthorized` döndürmelidir.
5. THE Webhook_Handler SHALL her webhook event'ini Logger ile kaydetmelidir.

---

### Requirement 10: Bot Webhook Mode

**User Story:** Bir DevOps mühendisi olarak, Telegram botunun production ortamında polling yerine webhook mode'da çalışmasını istiyorum; böylece daha güvenilir ve ölçeklenebilir bir yapı elde edilir.

#### Acceptance Criteria

1. WHEN `NODE_ENV` değeri `production` ise, THE Bot SHALL `bot.launch()` yerine `bot.createWebhook()` ile webhook mode'da başlamalıdır.
2. THE Bot SHALL webhook URL'ini `WEBHOOK_URL` ortam değişkeninden almalıdır.
3. WHEN `NODE_ENV` değeri `development` ise, THE Bot SHALL polling mode'da çalışmaya devam etmelidir.
4. THE Bot SHALL webhook mode'da Telegraf'ın built-in Express middleware'ini kullanarak webhook isteklerini işlemelidir.
5. THE Bot SHALL `WEBHOOK_SECRET` ortam değişkeni ile webhook güvenliğini sağlamalıdır.

---

### Requirement 11: Preview Mode Güvenliği

**User Story:** Bir güvenlik mühendisi olarak, preview mode'un production ortamında devre dışı bırakılmasını istiyorum; böylece gerçek kullanıcı verileri test hesaplarıyla karışmaz.

#### Acceptance Criteria

1. WHEN `NODE_ENV` değeri `production` ise, THE API SHALL `/auth/preview` endpoint'ine gelen istekleri `403 Forbidden` ile reddetmelidir.
2. THE API SHALL preview mode'u `ENABLE_PREVIEW_MODE` ortam değişkeni ile kontrol etmelidir.
3. WHERE `ENABLE_PREVIEW_MODE` değeri `true` ise, THE API SHALL preview endpoint'ini aktif etmelidir.
4. THE API SHALL preview kullanıcılarını `telegramId` alanında `preview_` prefix'i ile işaretlemeye devam etmelidir.

---

### Requirement 12: Live Event Multiplier Entegrasyonu

**User Story:** Bir oyun tasarımcısı olarak, aktif live event multiplier'larının tap ve chest hesaplamalarına doğru şekilde uygulanmasını istiyorum; böylece event dönemlerinde oyuncular gerçek bonus alır.

#### Acceptance Criteria

1. WHEN bir tap işlemi gerçekleştiğinde, THE API SHALL `getActiveTapMultiplier()` fonksiyonunun döndürdüğü değeri `LiveEventConfig.modifiersJson` içindeki `tapMultiplier` alanından okumalıdır.
2. WHEN bir chest düştüğünde, THE API SHALL `getActiveChestLuckMultiplier()` fonksiyonunun döndürdüğü değeri `LiveEventConfig.modifiersJson` içindeki `chestLuckMultiplier` alanından okumalıdır.
3. THE Live_Event SHALL aktif event olmadığında multiplier değeri olarak `1.0` döndürmelidir.
4. WHEN birden fazla aktif event varsa, THE Live_Event SHALL multiplier değerlerini çarparak birleştirmelidir.

---

### Requirement 13: Telegram Push Notification Servisi

**User Story:** Bir ürün yöneticisi olarak, kullanıcılara Telegram üzerinden push bildirim gönderilmesini istiyorum; böylece churn riski azaltılır ve kullanıcı geri dönüşü artırılır.

#### Acceptance Criteria

1. THE Notification_Worker SHALL her çalışma döngüsünde `telegramId` alanı `preview_` ile başlamayan kullanıcılara bildirim göndermelidir.
2. WHEN bir bildirim gönderildiğinde, THE Notification_Worker SHALL `NotificationLog` tablosuna `status: 'sent'` ve `sentAt` değerleriyle kayıt oluşturmalıdır.
3. IF Telegram API isteği başarısız olursa, THEN THE Notification_Worker SHALL `NotificationLog` kaydını `status: 'failed'` olarak güncellemeli ve hatayı Logger ile kaydetmelidir.
4. THE Notification_Worker SHALL aynı kullanıcıya aynı `type` için 12 saat içinde birden fazla bildirim göndermemelidir.
5. THE Notification_Worker SHALL `NotificationCampaign` tablosundaki `status: 'scheduled'` kampanyaları `scheduledAt` zamanı geldiğinde işlemelidir.

---

### Requirement 14: Analytics Daily Job

**User Story:** Bir veri analisti olarak, `AnalyticsDaily` tablosunun her gün otomatik olarak doldurulmasını istiyorum; böylece DAU, yeni kullanıcı sayısı ve gelir metrikleri takip edilebilir.

#### Acceptance Criteria

1. THE API SHALL her gün UTC 00:05'te `AnalyticsDaily` tablosunu bir önceki günün verileriyle dolduran bir cron job çalıştırmalıdır.
2. THE Analytics_Job SHALL bir önceki günün DAU değerini `lastSeenAt` alanına göre hesaplamalıdır.
3. THE Analytics_Job SHALL bir önceki günün yeni kullanıcı sayısını `createdAt` alanına göre hesaplamalıdır.
4. THE Analytics_Job SHALL bir önceki günün toplam tap sayısını `WalletLedgerEntry` tablosundan `entryType: 'tap_reward'` kayıtlarını sayarak hesaplamalıdır.
5. THE Analytics_Job SHALL bir önceki günün toplam gelirini `Payment` tablosundan `status: 'paid'` kayıtlarını toplayarak hesaplamalıdır.
6. IF aynı gün için kayıt zaten mevcutsa, THEN THE Analytics_Job SHALL mevcut kaydı güncellemeli (upsert) ve yeni kayıt oluşturmamalıdır.

---

### Requirement 15: Health Check DB Bağlantı Testi

**User Story:** Bir DevOps mühendisi olarak, `/health` endpoint'inin veritabanı bağlantısını da test etmesini istiyorum; böylece load balancer ve monitoring sistemleri gerçek servis durumunu anlayabilir.

#### Acceptance Criteria

1. WHEN `/health` endpoint'ine istek geldiğinde, THE API SHALL `prisma.$queryRaw\`SELECT 1\`` ile veritabanı bağlantısını test etmelidir.
2. IF veritabanı bağlantısı başarılı ise, THEN THE API SHALL `{ ok: true, db: 'connected', service: '...', time: '...' }` yanıtı ve `200` status kodu döndürmelidir.
3. IF veritabanı bağlantısı başarısız ise, THEN THE API SHALL `{ ok: false, db: 'disconnected', error: '...' }` yanıtı ve `503 Service Unavailable` status kodu döndürmelidir.
4. THE API SHALL health check yanıt süresini 3 saniye ile sınırlandırmalıdır.

---

### Requirement 16: Veritabanı Index Optimizasyonları

**User Story:** Bir veritabanı yöneticisi olarak, sık kullanılan sorgu alanlarının index'lenmesini istiyorum; böylece sorgu performansı artırılır.

#### Acceptance Criteria

1. THE API SHALL `User.username` alanına tekil olmayan (non-unique) bir index eklenmelidir.
2. THE API SHALL `User.telegramId` alanının zaten `@unique` olduğunu korumalıdır.
3. THE API SHALL `WalletLedgerEntry` tablosuna `(userId, entryType, createdAt)` composite index eklenmelidir.
4. THE API SHALL `Payment` tablosuna `(userId, status, createdAt)` composite index eklenmelidir.
5. THE API SHALL `NotificationLog` tablosuna `(userId, status, createdAt)` composite index eklenmelidir.

---

### Requirement 17: Soft Delete — Banned User Koruması

**User Story:** Bir veri yöneticisi olarak, yasaklanan kullanıcıların hard delete edilmemesini istiyorum; böylece audit trail ve fraud analizi için veriler korunur.

#### Acceptance Criteria

1. THE API SHALL `User` modelinde `deletedAt DateTime?` alanı eklenmelidir.
2. WHEN bir kullanıcı yasaklandığında, THE API SHALL `isBanned: true` ve `bannedAt` alanlarını güncellemeli; kullanıcıyı veritabanından silmemelidir.
3. THE API SHALL admin kullanıcı silme işlemlerinde hard delete yerine soft delete uygulamalıdır.
4. THE API SHALL soft delete edilmiş kullanıcıları normal sorgularda `deletedAt: null` filtresi ile dışarıda bırakmalıdır.

---

### Requirement 18: API Error Handling ve Retry Logic

**User Story:** Bir frontend geliştirici olarak, geçici ağ hatalarında API isteklerinin otomatik olarak yeniden denenmesini istiyorum; böylece kullanıcı deneyimi iyileştirilir.

#### Acceptance Criteria

1. THE Web SHALL `getJSON` ve `postJSON` fonksiyonlarında `503` ve ağ hatası durumlarında en fazla 3 kez yeniden deneme yapmalıdır.
2. THE Web SHALL yeniden denemeler arasında exponential backoff uygulamalıdır: 1. deneme 500ms, 2. deneme 1000ms, 3. deneme 2000ms beklenmelidir.
3. THE Web SHALL `401 Unauthorized` yanıtlarında yeniden deneme yapmadan oturumu sonlandırmalıdır.
4. IF tüm yeniden denemeler başarısız olursa, THEN THE Web SHALL kullanıcıya anlaşılır bir hata mesajı göstermelidir.

---

### Requirement 19: Gelişmiş Cihaz Parmak İzi

**User Story:** Bir güvenlik mühendisi olarak, cihaz parmak izinin daha güvenilir ve tahmin edilemez olmasını istiyorum; böylece multi-account tespiti iyileştirilir.

#### Acceptance Criteria

1. THE Web SHALL `@fingerprintjs/fingerprintjs` kütüphanesini kullanarak cihaz parmak izi üretmelidir.
2. THE Web SHALL parmak izi değerini `/auth/telegram` isteğinde `fingerprint` alanı olarak göndermelidir.
3. THE Web SHALL parmak izi hesaplamasını uygulama başlangıcında asenkron olarak yapmalı ve auth isteğini bekletmemelidir.
4. IF `@fingerprintjs/fingerprintjs` yüklenemezse, THEN THE Web SHALL mevcut basit hash yöntemine fallback yapmalıdır.

---

### Requirement 20: Yapılandırılmış Logging

**User Story:** Bir DevOps mühendisi olarak, API loglarının yapılandırılmış (JSON) formatta olmasını istiyorum; böylece log aggregation araçları (Datadog, Logtail vb.) ile kolayca analiz edilebilir.

#### Acceptance Criteria

1. THE API SHALL `pino` kütüphanesini kullanarak yapılandırılmış JSON log üretmelidir.
2. THE Logger SHALL her log kaydında `timestamp`, `level`, `service`, `message` alanlarını içermelidir.
3. THE API SHALL tüm `console.error` ve `console.log` çağrılarını Logger ile değiştirmelidir.
4. THE Logger SHALL `LOG_LEVEL` ortam değişkenine göre log seviyesini ayarlamalıdır; varsayılan değer `info` olmalıdır.
5. WHERE `NODE_ENV` değeri `development` ise, THE Logger SHALL okunabilir (pretty-print) formatta log üretmelidir.

---

### Requirement 21: Bağımlılık Kurulumu

**User Story:** Bir backend geliştirici olarak, gerekli production bağımlılıklarının projeye eklenmesini istiyorum; böylece yukarıdaki gereksinimler implement edilebilir.

#### Acceptance Criteria

1. THE API SHALL `express-rate-limit` paketini `apps/api/package.json` bağımlılıklarına eklemelidir.
2. THE API SHALL `pino` ve `pino-pretty` paketlerini `apps/api/package.json` bağımlılıklarına eklemelidir.
3. THE Web SHALL `@fingerprintjs/fingerprintjs` paketini `apps/web/package.json` bağımlılıklarına eklemelidir.
4. THE API SHALL `helmet` paketinin zaten mevcut olduğunu korumalıdır.
