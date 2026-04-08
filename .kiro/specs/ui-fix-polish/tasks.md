# UI Fix & Polish Tasks

## 1. Aslan Görseli Düzeltmeleri

- [x] 1.1 Loading screen'de aslan görseli görünmüyor — `game-loading__lion` CSS'ini düzelt, `object-fit: contain` ve boyut garantisi ekle
- [x] 1.2 Tap ekranında `game-tapper__character` aslan görseli taşıyor — `overflow: hidden` ve `object-fit: contain` düzelt
- [x] 1.3 `game-tapper__button` sabit px boyutları mobilde taşmaya neden oluyor — `width/height` değerlerini `min()` ile responsive yap

## 2. Tap Butonu Takılma Sorunu

- [x] 2.1 `handleTap` fonksiyonuna throttle ekle — aynı anda birden fazla API isteği gönderilmesini engelle (min 120ms)
- [x] 2.2 `TapMotionButton` animasyonu CPU'yu yoruyor — `animate` prop'undaki sürekli `boxShadow` animasyonunu kaldır, sadece `whileTap` bırak
- [x] 2.3 `game-tapper__button` CSS'indeki `animation: gameTapIdle` sürekli çalışıyor — `will-change: transform` ve `animation` optimizasyonu yap

## 3. Ses Animasyon Takılması

- [x] 3.1 `sfx.ts`'de her tap'ta yeni `AudioContext` oluşturuluyor — context'i lazy singleton olarak tut, `suspended` state'ini resume et
- [x] 3.2 `useFeedbackLayer` hook'u tap event'ini gameBus'tan dinliyor ama `handleTap` zaten direkt `playSoftClick()` çağırıyor — çift ses çalınmasını engelle
- [x] 3.3 `game-core-particle` animasyonu 5 element için sürekli `gameCoreParticleOrbit` çalıştırıyor — `animation-play-state: paused` ile enerji 0'da durdur

## 4. Telegram Bot Güncellemesi

- [x] 4.1 `apps/bot/src/index.ts` dosyasını kullanıcının verdiği yeni bot kodu ile güncelle — `node-telegram-bot-api` yerine mevcut `telegraf` yapısını koru, yeni butonları ekle

## 5. Genel Taşma ve Bozukluk Düzeltmeleri

- [x] 5.1 `game-loading__scene` mobilde `grid-template-columns` taşıyor — `@media (max-width: 720px)` için tek kolon yap
- [x] 5.2 `game-hero__intro` `grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr)` mobilde 320px minimum nedeniyle taşıyor — `minmax(0, 1fr)` yap
- [x] 5.3 `adn-balance-strip` flex wrap olmadığında küçük ekranlarda taşıyor — `flex-wrap: wrap` ve `overflow: hidden` ekle
- [x] 5.4 `game-tapper__float` pozisyonu `left/top` px değerleri button dışına çıkabiliyor — `overflow: hidden` ile kırp
