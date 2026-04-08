# Bugfix Requirements Document

## Introduction

Telegram Mini App açıldığında uygulama yüklenemiyor ve API 401/hata yanıtı dönüyor. Sorunun iki kaynağı var:

1. **initData zaman aşımı**: `verifyTelegramInitData` fonksiyonu `maxAgeSeconds = 300` (5 dakika) ile çalışıyor. Telegram'ın `auth_date` değeri bazen bu sınırı aşıyor (örn. kullanıcı botu açık bırakıp geri döndüğünde), doğrulama başarısız oluyor ve API 401 döndürüyor.

2. **Çift bot polling çakışması**: `apps/api/src/lib/telegram.ts` içindeki `startTelegramBot()` fonksiyonu API sunucusu başladığında `bot.launch()` ile polling başlatıyor. Aynı anda `apps/bot` uygulaması da aynı `BOT_TOKEN` ile polling yapıyor. İki süreç aynı token üzerinden polling yaparken Telegram API çakışması yaşanıyor ve bot/API hata üretiyor.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN kullanıcı Telegram Mini App'i açtığında `auth_date` değeri 300 saniyeden eski olduğunda THEN sistem 401 Unauthorized hatası döndürür ve uygulama açılmaz

1.2 WHEN `auth_date` geçerli olsa bile `apps/api` ve `apps/bot` aynı anda aynı BOT_TOKEN ile polling yaptığında THEN Telegram API çakışması yaşanır ve bot güncellemeleri alınamaz

1.3 WHEN `verifyTelegramInitData` başarısız olduğunda THEN `useAuth` hook'u `setError` çağırır ve kullanıcıya "Telegram oturumu kurulamadı" hatası gösterilir, uygulama yüklenemez

### Expected Behavior (Correct)

2.1 WHEN kullanıcı Telegram Mini App'i açtığında `auth_date` değeri 3600 saniyeye (1 saat) kadar eski olduğunda THEN sistem initData'yı geçerli kabul eder, kullanıcıyı doğrular ve JWT token döndürür

2.2 WHEN `apps/api` sunucusu başladığında `BOT_TOKEN` ortam değişkeni mevcut olsa bile THEN `startTelegramBot()` çağrılmamalı veya polling başlatmamalıdır; bot yönetimi yalnızca `apps/bot` uygulamasına bırakılmalıdır

2.3 WHEN `verifyTelegramInitData` başarılı olduğunda THEN sistem kullanıcıyı oluşturur/bulur, JWT token döndürür ve uygulama normal şekilde yüklenir

### Unchanged Behavior (Regression Prevention)

3.1 WHEN `auth_date` değeri 3600 saniyeden daha eski olduğunda THEN sistem SHA CONTINUE TO 401 döndürerek replay attack korumasını sürdürür

3.2 WHEN `initData` içinde `hash` parametresi eksik veya geçersizse THEN sistem SHALL CONTINUE TO doğrulamayı reddeder

3.3 WHEN geçerli bir Bearer JWT token ile istek geldiğinde THEN sistem SHALL CONTINUE TO kullanıcıyı token üzerinden doğrular

3.4 WHEN `apps/bot` uygulaması bağımsız çalıştığında THEN sistem SHALL CONTINUE TO bot komutlarını ve callback'leri işler

3.5 WHEN production ortamında `WEBHOOK_URL` tanımlıysa THEN `apps/bot` SHALL CONTINUE TO webhook modunda çalışır
