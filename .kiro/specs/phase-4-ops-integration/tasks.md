# Uygulama Planı: Phase 4 Ops & Performance Polish Pack

## Genel Bakış

Bu plan, ADN Token Telegram Mini App'in operasyonel olgunluk paketini adım adım hayata geçirir. Veritabanı şemasından başlayarak backend servisleri, frontend bileşenleri ve admin paneli sırasıyla uygulanır; her adım bir öncekinin üzerine inşa edilir.

## Görevler

- [x] 1. Veritabanı şeması ve temel altyapı
  - `apps/api/prisma/schema.prisma` dosyasına `ABTest`, `UserABTestAssignment` modellerini ekle
  - `LiveEventConfig` modeline `deletedAt DateTime?` alanı ekle
  - `User` modeline `adminRole String?` alanı ekle
  - `User`, `Payment` modellerine performans index'leri ekle (`lastSeenAt`, `createdAt`, `suspiciousScore`, `createdAt+status`)
  - Prisma migration oluştur
  - _Gereksinimler: 1.7, 2.1, 2.8, 3.3, 6.3, 14.8_

- [x] 2. Live Event Yönetim Servisi
  - [x] 2.1 `liveOpsAdmin.service.ts` dosyasına `createLiveEvent`, `updateLiveEvent`, `deleteLiveEvent` (soft delete) fonksiyonlarını ekle
    - `deleteLiveEvent` → `deletedAt` set eder, fiziksel silme yapmaz
    - `getPublicLiveEvents` → `deletedAt: null` filtresi uygular
    - _Gereksinimler: 1.1, 1.2, 1.7_
  - [x] 2.2 `scheduleLiveEvents` cron fonksiyonunu ekle; `isEnabled` alanını başlangıç/bitiş zamanına göre günceller
    - `apps/api/src/workers/liveEvent.worker.ts` dosyası oluştur, her dakika çalışır
    - Etkinlik başladığında `notification.service` üzerinden bildirim gönderir
    - _Gereksinimler: 1.3, 1.4, 1.8_
  - [x] 2.3 `getActiveEventsWithStats` fonksiyonunu ekle; aktif oyuncu sayısı ve kalan süreyi döndürür
    - _Gereksinimler: 1.5, 1.6_
  - [x] 2.4 Live event round-trip property testi yaz
    - **Özellik 1: Live Event Round-Trip Tutarlılığı**
    - **Doğrular: Gereksinim 1.2**
  - [x] 2.5 Soft delete invariant property testi yaz
    - **Özellik 3: Soft Delete Invariantı**
    - **Doğrular: Gereksinim 1.7**
  - [x] 2.6 Multiplier güncelliği property testi yaz
    - **Özellik 2: Live Event Multiplier Güncelliği**
    - **Doğrular: Gereksinim 1.6**

- [x] 3. A/B Testing Servisi
  - [x] 3.1 `apps/api/src/services/abTest.service.ts` dosyasını oluştur
    - `createTest`, `concludeTest`, `rolloutWinner` fonksiyonlarını yaz
    - `rolloutWinner` → tüm kullanıcıların `pricingVariant` alanını günceller
    - _Gereksinimler: 2.1, 2.5, 2.7, 2.8_
  - [x] 3.2 `assignUserToTest` ve `getActiveTestsForUser` fonksiyonlarını ekle
    - Deterministik atama: `hash(userId + testId) % variantCount`
    - Mevcut `experimentPricing.ts` içindeki `assignPricingVariant` mantığını genelleştir
    - _Gereksinimler: 2.2, 2.3, 2.6_
  - [x] 3.3 Deterministik atama property testi yaz
    - **Özellik 4: A/B Test Deterministik Atama**
    - **Doğrular: Gereksinim 2.2, 2.6**
  - [x] 3.4 Rollout tamamlığı property testi yaz
    - **Özellik 5: A/B Test Rollout Tamamlığı**
    - **Doğrular: Gereksinim 2.5**

- [x] 4. Analytics Dashboard Servisi
  - [x] 4.1 `analyticsAdmin.service.ts` dosyasına `getMetricsTrend`, `getSegmentedUsers` fonksiyonlarını ekle
    - `getMetricsTrend(days)` → son N günün DAU, ARPU, gelir verilerini döndürür
    - `getSegmentedUsers(filter)` → level, spending, retention filtresi uygular
    - _Gereksinimler: 3.1, 3.2, 3.3, 3.4, 3.7_
  - [x] 4.2 `calculateLTV`, `calculateARPU`, `detectAnomalies` fonksiyonlarını ekle
    - `calculateARPU` → `Payment` tablosundan `status: 'paid'` toplamı / DAU
    - `detectAnomalies` → önceki güne göre %20+ düşüşte uyarı üretir
    - _Gereksinimler: 3.5, 3.6, 3.8, 12.1, 12.2_
  - [x] 4.3 DAU hesaplama doğruluğu property testi yaz
    - **Özellik 6: DAU Hesaplama Doğruluğu**
    - **Doğrular: Gereksinim 3.3**
  - [x] 4.4 ARPU hesaplama doğruluğu property testi yaz
    - **Özellik 7: ARPU Hesaplama Doğruluğu**
    - **Doğrular: Gereksinim 3.5, 12.1**
  - [x] 4.5 Anomali tespiti eşiği property testi yaz
    - **Özellik 8: Anomali Tespiti Eşiği**
    - **Doğrular: Gereksinim 3.8**

- [x] 5. Checkpoint — Backend servisler tamamlandı
  - Tüm testlerin geçtiğini doğrula, sorular varsa kullanıcıya sor.

- [x] 6. Fraud Detection Servisi
  - [x] 6.1 `apps/api/src/services/fraudDetection.service.ts` dosyasını oluştur
    - `detectMultiAccount(fingerprint, userId)` → aynı fingerprint'ten çoklu hesap tespiti
    - `evaluateTapAnomaly(userId, tapPattern)` → `suspiciousScore` hesaplar
    - `suspendAccount`, `createFraudAlert` fonksiyonlarını yaz
    - Mevcut `fraud.ts` ve `advancedAntiCheat.service.ts` mantığını entegre et
    - _Gereksinimler: 13.1, 13.2, 13.3, 13.4, 13.6, 13.8_
  - [x] 6.2 Fraud score anomali tespiti property testi yaz
    - **Özellik 16: Fraud Score Anomali Tespiti**
    - **Doğrular: Gereksinim 13.1, 13.2**
  - [x] 6.3 Multi-account tespiti property testi yaz
    - **Özellik 17: Multi-Account Tespiti**
    - **Doğrular: Gereksinim 13.3**
  - [x] 6.4 Withdrawal risk skoru monotonluğu property testi yaz
    - **Özellik 18: Withdrawal Risk Skoru Monotonluğu**
    - **Doğrular: Gereksinim 13.4**

- [x] 7. Notification Queue Geliştirmesi
  - [x] 7.1 `notification.service.ts` dosyasına `scheduleNotification`, `sendBatch`, `checkRateLimit` fonksiyonlarını ekle
    - `checkRateLimit` → 1 saatte max 5 bildirim kuralını uygular
    - `sendBatch` → max 100 bildirim/batch Telegram API'sine gönderir
    - _Gereksinimler: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_
  - [x] 7.2 `notification.worker.ts` dosyasını FIFO queue mantığı ile güncelle
    - _Gereksinimler: 11.1_
  - [x] 7.3 Notification rate limit property testi yaz
    - **Özellik 14: Notification Rate Limit**
    - **Doğrular: Gereksinim 11.6**
  - [x] 7.4 Notification FIFO sırası property testi yaz
    - **Özellik 15: Notification FIFO Sırası**
    - **Doğrular: Gereksinim 11.1**

- [x] 8. Backend API Route'ları
  - [x] 8.1 Live event CRUD route'larını `apps/api/src/routes/` altına ekle; `adminOnlyMiddleware` ile koru
    - `POST /admin/live-events`, `PUT /admin/live-events/:id`, `DELETE /admin/live-events/:id`, `GET /admin/live-events`
    - _Gereksinimler: 1.1, 14.3_
  - [x] 8.2 A/B test route'larını ekle
    - `POST /admin/ab-tests`, `POST /admin/ab-tests/:id/conclude`, `POST /admin/ab-tests/:id/rollout`
    - _Gereksinimler: 2.1, 14.2_
  - [x] 8.3 Analytics route'larını ekle
    - `GET /admin/analytics/metrics`, `GET /admin/analytics/segments`, `GET /admin/analytics/anomalies`
    - _Gereksinimler: 3.1, 14.5_
  - [x] 8.4 Fraud management route'larını ekle
    - `GET /admin/fraud/cases`, `POST /admin/fraud/suspend/:userId`
    - _Gereksinimler: 13.6, 14.6_
  - [x] 8.5 `/health` endpoint'ini `apps/api/src/index.ts` dosyasına ekle; veritabanı bağlantısını test eder
    - _Gereksinimler: 15.1_
  - [x] 8.6 RBAC middleware'ini `adminOnlyMiddleware.ts` dosyasına ekle; `AdminRole` enum'una göre yetki kontrolü yapar
    - _Gereksinimler: 14.8_

- [x] 9. Checkpoint — API katmanı tamamlandı
  - Tüm testlerin geçtiğini doğrula, sorular varsa kullanıcıya sor.

- [x] 10. Frontend — Device Profiler ve Performans
  - [x] 10.1 `apps/web/src/hooks/useDeviceProfiler.ts` hook'unu oluştur
    - `DeviceCategory` (`high | mid | low`) ve `DeviceProfile` tiplerini tanımla
    - `navigator.deviceMemory`, `navigator.connection.effectiveType`, FPS ölçümü ile kategori belirle
    - Profili `localStorage['deviceProfile']`'a kaydet
    - _Gereksinimler: 10.1, 10.2, 10.3, 10.5_
  - [x] 10.2 `useLowPerfMode.ts` hook'unu `useDeviceProfiler` ile entegre et
    - `body[data-perf-tier]` attribute'unu `high | mid | low` değerleriyle set et
    - CSS custom property override'larını global CSS'e ekle (`--animation-duration`, `--blur-amount`)
    - _Gereksinimler: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [x] 10.3 FPS monitörünü ekle; ortalama FPS %20 düşerse kategori düşür
    - _Gereksinimler: 10.4, 10.7_
  - [x] 10.4 Low perf mode FPS eşiği property testi yaz
    - **Özellik 9: Low Perf Mode FPS Eşiği**
    - **Doğrular: Gereksinim 4.2**

- [x] 11. Frontend — Error Handling ve Telemetry
  - [x] 11.1 `apps/web/src/components/ErrorBoundary.tsx` bileşenini oluştur
    - `componentDidCatch` → `telemetry.captureError` çağırır
    - Fallback UI: retry butonu ve anlaşılır hata mesajı içerir
    - _Gereksinimler: 7.1, 7.2, 7.3_
  - [x] 11.2 `apps/web/src/lib/apiClient.ts` dosyasını oluştur
    - `fetchWithRetry(url, options, maxRetries=3)` → 5xx için exponential backoff, 4xx için hemen hata
    - Offline detection: `navigator.onLine` kontrolü
    - _Gereksinimler: 7.5, 7.6, 7.7_
  - [x] 11.3 `apps/web/src/lib/telemetry.ts` dosyasını oluştur
    - `TelemetryClient` interface'ini ve implementasyonunu yaz
    - Batching: 50 event veya 10 saniyede `flush()` tetikler
    - PII filtreleme: `email`, `phone`, `address`, `name` alanlarını payload'dan çıkar
    - Offline queue: `localStorage['telemetry_queue']`'ya yazar
    - _Gereksinimler: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_
  - [x] 11.4 Error boundary hata yakalama property testi yaz
    - **Özellik 10: Error Boundary Hata Yakalama**
    - **Doğrular: Gereksinim 7.1**
  - [x] 11.5 API retry davranışı property testi yaz
    - **Özellik 11: API Retry Davranışı**
    - **Doğrular: Gereksinim 7.6, 7.7**
  - [x] 11.6 Telemetry batching invariant property testi yaz
    - **Özellik 12: Telemetry Batching Invariantı**
    - **Doğrular: Gereksinim 9.6**
  - [x] 11.7 Telemetry PII filtreleme property testi yaz
    - **Özellik 13: Telemetry PII Filtreleme**
    - **Doğrular: Gereksinim 9.7**

- [x] 12. Frontend — Service Worker
  - `apps/web/public/sw.js` dosyasını oluştur
  - Cache-First stratejisi: statik varlıklar (JS/CSS/images), 30 gün
  - Stale-While-Revalidate: `/profile`, `/game/status`, 5 dakika
  - Network-First: diğer API istekleri
  - Offline fallback sayfası
  - _Gereksinimler: 5.1, 5.2, 5.3, 5.4, 15.6_

- [x] 13. Frontend — Accessibility
  - Tüm interaktif öğelere `aria-label`, `role`, `aria-describedby` attribute'ları ekle
  - Form alanlarına `label` element'leri ekle; `for` attribute'u ile eşleştir
  - `:focus-visible` stillerini global CSS'e ekle
  - Error mesajlarını `aria-live="polite"` ile duyur
  - `prefers-reduced-motion` media query'sini animasyon CSS'ine ekle
  - _Gereksinimler: 8.1, 8.2, 8.3, 8.4, 8.6, 8.7, 8.8_

- [x] 14. Admin Panel Sayfaları
  - [x] 14.1 `apps/web/src/admin/pages/LiveEventsPage.tsx` bileşenini oluştur
    - Event oluşturma/düzenleme formu (ad, açıklama, zaman, multiplier'lar)
    - Aktif event listesi (kalan süre, multiplier'lar, oyuncu sayısı)
    - _Gereksinimler: 1.1, 1.5, 14.3_
  - [x] 14.2 `apps/web/src/admin/pages/ABTestsPage.tsx` bileşenini oluştur
    - Test oluşturma formu ve aktif test listesi
    - Variant metrik karşılaştırması (DAU, ARPU, retention)
    - _Gereksinimler: 2.1, 2.4, 14.2_
  - [x] 14.3 `apps/web/src/admin/pages/AnalyticsDashboard.tsx` bileşenini oluştur
    - DAU, MAU, ARPU, LTV, retention grafikleri
    - Tarih aralığı seçici ve segmentasyon filtresi
    - Anomali uyarıları
    - _Gereksinimler: 3.1, 3.2, 3.7, 3.8, 14.5_
  - [x] 14.4 `apps/web/src/admin/pages/FraudManagementPage.tsx` bileşenini oluştur
    - Şüpheli hesap listesi ve suspend/unsuspend işlemleri
    - _Gereksinimler: 13.6, 14.6_
  - [x] 14.5 `apps/web/src/admin/pages/NotificationCampaigns.tsx` bileşenini oluştur
    - Kampanya oluşturma formu (hedef segment, zamanlama, metin)
    - _Gereksinimler: 11.3, 11.7, 14.4_
  - [x] 14.6 `AdminLayout.tsx` dosyasını yeni sayfaları içerecek şekilde güncelle; RBAC'a göre menü öğelerini göster/gizle
    - _Gereksinimler: 14.8_

- [x] 15. Checkpoint — Frontend tamamlandı
  - Tüm testlerin geçtiğini doğrula, sorular varsa kullanıcıya sor.

- [x] 16. Production Readiness
  - [x] 16.1 `apps/api/src/index.ts` dosyasına graceful shutdown ekle; SIGTERM'de mevcut istekler tamamlanır
    - _Gereksinimler: 15.2_
  - [x] 16.2 Rate limiting middleware'ini `apps/api/src/middlewares/` altına ekle
    - _Gereksinimler: 15.3_
  - [x] 16.3 Request logging middleware'ini ekle; tüm istek/yanıtlar log'lanır
    - _Gereksinimler: 15.4_
  - [x] 16.4 CORS konfigürasyonunu `apps/api/src/index.ts` dosyasında güncelle; sadece yetkili origin'ler kabul edilir
    - _Gereksinimler: 15.5_

- [x] 17. Final Checkpoint — Tüm testler geçiyor
  - Tüm testlerin geçtiğini doğrula, sorular varsa kullanıcıya sor.

## Notlar

- `*` ile işaretli görevler isteğe bağlıdır; MVP için atlanabilir
- Her görev ilgili gereksinim numarasına referans verir
- Property testleri için `fast-check` kütüphanesi kullanılır
- Checkpoint'ler artımlı doğrulama sağlar
