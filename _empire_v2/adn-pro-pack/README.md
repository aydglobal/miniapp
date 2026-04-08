# ADN Crypto Empire — Pro Pack

Bu paket mevcut ADN mini app mantığını daha güçlü bir oyun ekonomisine taşımak için hazırlanmış Vite + React + TypeScript front-end setidir.

## İçerik
- Tap + combo + crit economy
- Idle income
- Upgrade tree
- Level gates
- Chest system
- Mission rewards
- Prestige reset
- Event rotation
- Premium gem layer
- LocalStorage save sistemi

## Kurulum
```bash
npm install
npm run dev
```

## Dosyalar
- `src/App.tsx`: Ana oyun akışı
- `src/index.css`: Görsel tema
- `package.json`: bağımlılıklar ve scriptler

## Entegrasyon Notu
Bu paket front-end çalışır halde gelir. Aşağıdakiler ayrıca bağlanabilir:
- gerçek wallet connect
- backend referral sistemi
- leaderboard API
- ödeme / mağaza altyapısı
- Telegram Mini App bridge

## Tavsiye edilen sonraki adım
1. Mevcut markaya göre görselleri özelleştir
2. Backend görev/referral sistemi ekle
3. Wallet ve on-chain utility bağla
4. Event içeriklerini haftalık olarak yönet

## Son Güçlendirme Paketi
Bu sürüme eklenen mission system dosyaları:

- `src/game/missions/dailyMissionGenerator.ts`
- `src/game/missions/missionPersistence.ts`
- `src/game/missions/useMissionEngine.ts`
- `src/components/missions/MissionDrawerMobile.tsx`
- `src/components/missions/MissionClaimModal.tsx`

### Ne yapar?
- Level / prestige / VIP bazlı günlük görev üretir.
- Görevleri localStorage ile saklar.
- Claim archive tutar.
- Mobil drawer görev paneli sağlar.
- Claim modal ile ödül akışını açar.

### Entegrasyon kısa not
`useMissionEngine` hook'una oyun istatistiklerini ver, dönen `activeDaily` listesini `MissionDrawerMobile` içine geçir.
`claimMission()` sonucunda dönen reward patch'i ana ekonomi state'ine uygula.
