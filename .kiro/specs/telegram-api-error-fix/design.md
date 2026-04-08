# Telegram API Error Fix — Bugfix Design

## Overview

Bu doküman iki ayrı bug için fix yaklaşımını formalize eder:

1. **initData Zaman Aşımı**: `verifyTelegramInitData` fonksiyonundaki `maxAgeSeconds` varsayılan değeri 300'den 3600'e çıkarılarak kullanıcıların 1 saate kadar geçerli oturumlarla giriş yapabilmesi sağlanacak.

2. **Çift Bot Polling Çakışması**: `apps/api/src/index.ts` içindeki `startTelegramBot()` çağrısı kaldırılarak bot polling yönetimi yalnızca `apps/bot/src/index.ts`'e bırakılacak.

Her iki fix de minimal ve hedefli olup mevcut davranışı bozmayacak şekilde tasarlanmıştır.

## Glossary

- **Bug_Condition (C)**: Bugı tetikleyen koşul — (1) `auth_date` 300-3600 saniye aralığında olduğunda doğrulamanın başarısız olması; (2) API sunucusunun `startTelegramBot()` çağırarak ikinci bir polling süreci başlatması
- **Property (P)**: Beklenen doğru davranış — (1) 3600 saniyeye kadar geçerli `auth_date` kabul edilmeli; (2) API sunucusu bot polling başlatmamalı
- **Preservation**: Fix sonrasında değişmemesi gereken mevcut davranışlar — replay attack koruması, hash doğrulaması, JWT akışı, `apps/bot` bağımsız çalışması
- **verifyTelegramInitData**: `apps/api/src/lib/telegram.ts` içindeki fonksiyon; Telegram `initData` string'ini HMAC-SHA256 ile doğrular ve `auth_date` yaşını kontrol eder
- **startTelegramBot**: `apps/api/src/lib/telegram.ts` içindeki fonksiyon; Telegraf ile polling modu bot başlatır — API sunucusunda çağrılmamalıdır
- **maxAgeSeconds**: `verifyTelegramInitData` parametresi; `auth_date`'in kaç saniyeye kadar geçerli sayılacağını belirler
- **auth_date**: Telegram'ın `initData` içine eklediği Unix timestamp; kullanıcının Mini App'i açtığı zamanı gösterir

## Bug Details

### Bug 1: initData Zaman Aşımı

`verifyTelegramInitData` fonksiyonu `maxAgeSeconds = 300` (5 dakika) varsayılanıyla çalışıyor. Kullanıcı botu açık bırakıp geri döndüğünde veya `auth_date` 5 dakikadan eski olduğunda doğrulama başarısız oluyor ve API 401 döndürüyor.

**Formal Specification:**
```
FUNCTION isBugCondition_1(initData, botToken)
  INPUT: initData: string, botToken: string
  OUTPUT: boolean

  authDate := getAuthDateFromInitData(initData)
  IF authDate IS NULL THEN RETURN false END IF

  ageSeconds := floor(now() / 1000) - authDate

  hashValid := hmacSha256Check(initData, botToken)  // hash gerçekten geçerli

  RETURN hashValid = true
         AND ageSeconds > 300
         AND ageSeconds <= 3600
         // Yani: hash geçerli ama maxAgeSeconds=300 yüzünden reddediliyor
END FUNCTION
```

### Bug 2: Çift Bot Polling Çakışması

`apps/api/src/index.ts` sunucu başladığında `startTelegramBot()` çağırıyor. Bu fonksiyon `bot.launch()` ile polling başlatıyor. Aynı anda `apps/bot/src/index.ts` de aynı `BOT_TOKEN` ile polling yapıyor. İki süreç aynı token üzerinden yarışıyor.

**Formal Specification:**
```
FUNCTION isBugCondition_2(environment)
  INPUT: environment: { BOT_TOKEN: string | undefined, apiServerRunning: boolean }
  OUTPUT: boolean

  RETURN environment.BOT_TOKEN IS NOT NULL
         AND environment.apiServerRunning = true
         AND startTelegramBot_is_called_in_api_index = true
         // Yani: API sunucusu başladığında bot polling de başlıyor
END FUNCTION
```

### Examples

**Bug 1 Örnekleri:**
- Kullanıcı botu 10 dakika önce açtı, Mini App'e geri döndü → `ageSeconds = 600 > 300` → 401 Unauthorized (BUG: 600 < 3600 olduğu için geçerli olmalıydı)
- Kullanıcı botu 4 dakika önce açtı → `ageSeconds = 240 < 300` → Başarılı (doğru davranış, değişmeyecek)
- Kullanıcı botu 2 saat önce açtı → `ageSeconds = 7200 > 3600` → 401 Unauthorized (doğru davranış, replay attack koruması)

**Bug 2 Örnekleri:**
- API sunucusu başladı, `BOT_TOKEN` mevcut → `startTelegramBot()` çağrıldı → `bot.launch()` polling başlattı → `apps/bot` da polling yapıyor → Telegram API çakışması (BUG)
- `BOT_TOKEN` tanımlı değil → `startTelegramBot()` erken çıkıyor → Çakışma yok (kısmi koruma, ama yeterli değil)

## Expected Behavior

### Preservation Requirements

**Değişmemesi Gereken Davranışlar:**
- `auth_date` değeri 3600 saniyeden daha eski olduğunda sistem 401 döndürerek replay attack korumasını sürdürmelidir
- `initData` içinde `hash` parametresi eksik veya geçersizse sistem doğrulamayı reddetmelidir
- Geçerli Bearer JWT token ile gelen istekler token üzerinden doğrulanmaya devam etmelidir
- `apps/bot` uygulaması bağımsız olarak bot komutlarını ve callback'leri işlemeye devam etmelidir
- Production ortamında `WEBHOOK_URL` tanımlıysa `apps/bot` webhook modunda çalışmaya devam etmelidir

**Kapsam:**
Bug condition'ı tetiklemeyen tüm girdiler bu fix'ten etkilenmemelidir:
- `ageSeconds <= 300` olan geçerli `initData` (zaten çalışıyor, değişmeyecek)
- `ageSeconds > 3600` olan `initData` (replay attack — reddedilmeye devam edecek)
- Geçersiz hash içeren `initData` (reddedilmeye devam edecek)
- JWT Bearer token ile gelen istekler (değişmeyecek)
- `apps/bot` üzerinden gelen bot etkileşimleri (değişmeyecek)

## Hypothesized Root Cause

### Bug 1: initData Zaman Aşımı

1. **Muhafazakar Varsayılan Değer**: `maxAgeSeconds = 300` güvenlik odaklı seçilmiş ancak Telegram Mini App kullanım senaryoları için çok kısa. Telegram'ın resmi önerisi 1 saate kadar (3600 saniye) tolerans tanımaktır.

2. **Çağrı Noktasında Override Yok**: `authMiddleware` veya `auth.routes.ts` içinde `verifyTelegramInitData` çağrılırken `maxAgeSeconds` parametresi geçilmiyor, varsayılan 300 kullanılıyor.

### Bug 2: Çift Bot Polling Çakışması

1. **Yanlış Sorumluluk Dağılımı**: `startTelegramBot()` fonksiyonu `telegram.ts` içinde tanımlanmış ve `apps/api/src/index.ts` içinde sunucu başlangıcında çağrılıyor. Bot yönetimi API'nin sorumluluğu değil.

2. **Token Çakışması**: Telegram, aynı bot token'ı için yalnızca bir aktif polling bağlantısına izin veriyor. İki süreç aynı token ile polling yaptığında güncellemeler rastgele bölünüyor veya hatalar oluşuyor.

3. **Mimari Ayrışma Eksikliği**: `apps/bot` ve `apps/api` ayrı servisler olarak deploy ediliyor ancak `apps/api` bot işlevselliğini de üstleniyor.

## Correctness Properties

Property 1: Bug Condition — initData Zaman Aşımı Toleransı

_For any_ `initData` where the HMAC-SHA256 hash is valid AND `auth_date` age is between 300 and 3600 seconds (inclusive), the fixed `verifyTelegramInitData` function SHALL return `true`, allowing the user to authenticate successfully.

**Validates: Requirements 2.1**

Property 2: Preservation — Replay Attack Koruması

_For any_ `initData` where `auth_date` age is greater than 3600 seconds, the fixed `verifyTelegramInitData` function SHALL return `false`, preserving the replay attack protection behavior identical to the original function.

**Validates: Requirements 3.1, 3.2**

Property 3: Bug Condition — API Sunucusunda Bot Polling Olmamalı

_For any_ API server startup where `BOT_TOKEN` is defined, the fixed `apps/api/src/index.ts` SHALL NOT call `startTelegramBot()` or initiate any Telegram bot polling, ensuring only `apps/bot` manages bot interactions.

**Validates: Requirements 2.2**

Property 4: Preservation — apps/bot Bağımsız Çalışması

_For any_ environment where `apps/bot` is running independently, the fixed code SHALL produce exactly the same bot behavior as before — webhook mode in production with `WEBHOOK_URL`, polling mode otherwise — without any interference from `apps/api`.

**Validates: Requirements 3.4, 3.5**

## Fix Implementation

### Changes Required

**Fix 1: maxAgeSeconds Varsayılan Değeri**

File: `apps/api/src/lib/telegram.ts`

Function: `verifyTelegramInitData`

Specific Changes:
1. **Default Parameter Update**: `maxAgeSeconds = 300` → `maxAgeSeconds = 3600`
   - Tek satır değişikliği, fonksiyon imzasında
   - Tüm çağrı noktaları override etmediği için otomatik olarak yeni değeri kullanacak

---

**Fix 2: API Sunucusundan Bot Polling Kaldırma**

File: `apps/api/src/index.ts`

Specific Changes:
1. **Import Kaldırma**: `import { startTelegramBot } from './lib/telegram'` satırı kaldırılacak (veya kullanılmıyorsa lint uyarısı verecek)
2. **Çağrı Kaldırma**: `startTelegramBot().catch(...)` satırı `server.listen` callback'inden kaldırılacak

Not: `startTelegramBot` fonksiyonunun kendisi `telegram.ts` içinde kalabilir (ileride test veya referans için) ancak API sunucusundan çağrılmamalıdır. Alternatif olarak fonksiyon tamamen kaldırılabilir — bu karar implementasyon aşamasında alınacak.

## Testing Strategy

### Validation Approach

İki aşamalı yaklaşım: önce bug'ı gösteren counterexample'lar üretilecek (unfixed kod üzerinde), ardından fix doğrulanacak ve preservation kontrol edilecek.

### Exploratory Bug Condition Checking

**Goal**: Fix uygulanmadan önce bug'ı somut olarak göster ve root cause analizini doğrula/çürüt.

**Test Plan**: `verifyTelegramInitData` için geçerli HMAC hash'e sahip ancak `auth_date` 300-3600 saniye aralığında olan `initData` string'leri oluştur. Unfixed kod üzerinde çalıştır ve `false` döndürdüğünü gözlemle.

**Test Cases**:
1. **6 Dakika Önce Test**: `auth_date = now - 360` ile geçerli hash → unfixed kodda `false` döner (BUG)
2. **30 Dakika Önce Test**: `auth_date = now - 1800` ile geçerli hash → unfixed kodda `false` döner (BUG)
3. **59 Dakika Önce Test**: `auth_date = now - 3540` ile geçerli hash → unfixed kodda `false` döner (BUG)
4. **API Polling Test**: API sunucusu başladığında `startTelegramBot` çağrıldığını assert et → unfixed kodda `true` (BUG)

**Expected Counterexamples**:
- `verifyTelegramInitData` geçerli hash'e rağmen `false` döndürüyor çünkü `ageSeconds > 300`
- `apps/api/src/index.ts` içinde `startTelegramBot` çağrısı mevcut

### Fix Checking

**Goal**: Bug condition'ı tetikleyen tüm girdiler için fix'in beklenen davranışı ürettiğini doğrula.

**Pseudocode:**
```
FOR ALL initData WHERE isBugCondition_1(initData, botToken) DO
  result := verifyTelegramInitData_fixed(initData, botToken)
  ASSERT result = true  // Artık geçerli kabul edilmeli
END FOR

ASSERT startTelegramBot_not_called_in_api_index = true
```

### Preservation Checking

**Goal**: Bug condition'ı tetiklemeyen tüm girdiler için fix'in orijinal fonksiyonla aynı sonucu ürettiğini doğrula.

**Pseudocode:**
```
FOR ALL initData WHERE NOT isBugCondition_1(initData, botToken) DO
  ASSERT verifyTelegramInitData_original(initData, botToken)
       = verifyTelegramInitData_fixed(initData, botToken)
END FOR
```

**Testing Approach**: Property-based testing önerilir çünkü:
- `auth_date` aralıkları için otomatik olarak çok sayıda test case üretir
- `ageSeconds > 3600` sınırının korunduğunu güçlü şekilde garanti eder
- Hash doğrulama mantığının değişmediğini tüm input uzayında doğrular

**Test Cases**:
1. **Replay Attack Preservation**: `auth_date = now - 7200` → fix sonrasında da `false` dönmeli
2. **Geçersiz Hash Preservation**: Herhangi bir `auth_date` ile yanlış hash → fix sonrasında da `false` dönmeli
3. **Kısa Süre Preservation**: `auth_date = now - 60` ile geçerli hash → fix öncesi ve sonrası `true` dönmeli
4. **JWT Akışı Preservation**: Bearer token ile gelen istekler `verifyTelegramInitData` çağrılmadan doğrulanmaya devam etmeli

### Unit Tests

- `verifyTelegramInitData` için `ageSeconds` sınır değerleri: 299, 300, 301, 3599, 3600, 3601
- Geçersiz hash ile tüm `ageSeconds` değerleri → her zaman `false`
- `auth_date` eksik `initData` → `false`
- `hash` eksik `initData` → `false`

### Property-Based Tests

- Rastgele `ageSeconds in [0, 3600]` ve geçerli hash → `true` dönmeli (fix sonrası)
- Rastgele `ageSeconds > 3600` ve geçerli hash → `false` dönmeli (her zaman)
- Rastgele geçersiz hash ve herhangi `ageSeconds` → `false` dönmeli (her zaman)
- `apps/api` başlangıcında bot polling başlatılmadığını doğrula

### Integration Tests

- Mini App açılışı simülasyonu: `auth_date = now - 600` ile tam auth akışı → 200 ve JWT token dönmeli
- `apps/bot` bağımsız başlatma: webhook/polling modunun doğru çalıştığını doğrula
- API sunucusu başlatma: Telegram polling bağlantısı açılmadığını doğrula
