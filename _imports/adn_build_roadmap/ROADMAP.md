# ADN Tap-to-Earn Build Roadmap

Bu plan, oyunu **demo** seviyesinden **yayınlanabilir** seviyeye taşımak için sıralanmıştır.  
Öncelik mantığı: **çekirdek oynanış → büyüme → kontrol → para/ödül → canlı operasyon**.

---

## Faz 0 — Repo Temizliği ve Production Temeli

### Amaç
Kod tabanını tek doğru sürüme düşürmek ve deploy edilebilir hale getirmek.

### Yapılacaklar
1. `.env`, `_tmp_*`, eski kopya route/service dosyalarını temizle
2. `apps/api`, `apps/web`, `apps/bot` için tek doğru entrypoint belirle
3. Railway/Vercel environment variable listesini netleştir
4. Prisma schema'yı tek sürüme indir
5. `README` içinde tek kurulum akışı yaz
6. `health` endpoint aç
7. request logger ekle
8. global error handler ekle

### Çıkış Kriteri
- Repo derleniyor
- API ayağa kalkıyor
- Web deploy edilebiliyor
- Prisma migrate çalışıyor

---

## Faz 1 — Çekirdek Oyun Motoru

### Öncelik 1.1 — Profile / State
**Route**
- `GET /profile`
- `GET /game/state`

**Döndürmesi gerekenler**
- level
- xp
- coins / ADN
- energy / maxEnergy
- passive income
- unlocks
- owned upgrades
- active boosts
- active missions
- daily reward status
- referral summary

**Bağımlılıklar**
- User
- Upgrade ownership
- Mission assignment
- Daily reward state

---

### Öncelik 1.2 — Tap Engine
**Route**
- `POST /game/tap`

**Mantık**
- energy düş
- tap reward ver
- xp ekle
- combo / crit uygula
- görev ilerlet
- anti-cheat kontrolü yap
- level-up uygunsa tetikle

**Ek alt servisler**
- `tapEngine.service.ts`
- `antiCheat.service.ts`
- `economyLedger.service.ts`

---

### Öncelik 1.3 — Passive Income / Offline Sync
**Route**
- `POST /income/sync`
- `POST /income/claim`

**Mantık**
- son girişten bu yana süreyi hesapla
- passive income üret
- max offline cap uygula
- gerekiyorsa claim et
- görev ilerlet

---

### Öncelik 1.4 — Shop / Upgrade
**Route**
- `GET /shop`
- `POST /shop/purchase`
- `POST /shop/upgrade`

**Mantık**
- unlock kontrolü
- prerequisite kontrolü
- fiyat hesaplama
- seviye artışı
- passive income güncellemesi
- ledger log yazımı

---

### Öncelik 1.5 — Level / XP / Unlocks
**Route**
- `GET /levels`
- `POST /level/sync`

**Mantık**
- toplam XP'den level hesapla
- yeni unlock aç
- unlock reward ver
- frontend'e lock map dön

---

### Öncelik 1.6 — Mission Engine
**Route**
- `GET /missions`
- `POST /missions/claim/:missionId`

**Mantık**
- görev ata
- tap / referral / login / purchase event'lerinden ilerlet
- tamamlanınca reward ver
- zincir görevi aç

---

### Öncelik 1.7 — Daily Reward / Streak
**Route**
- `GET /daily`
- `POST /daily/claim`

**Mantık**
- bugünkü claim durumu
- streak devam / reset
- streak saver varsa uygula
- görevlerle entegre et

### Faz 1 Çıkış Kriteri
- Oyuncu girip tap yapabiliyor
- upgrade alabiliyor
- pasif kazanç alabiliyor
- görev ve günlük ödül çalışıyor
- level atlıyor

---

## Faz 2 — Growth ve Retention

### Öncelik 2.1 — Referral Engine
**Route**
- `GET /referral`
- `POST /referral/apply`
- `GET /referral/tasks`

**Mantık**
- referral code
- self-referral engeli
- same device / same IP kontrolü
- kaliteli referral ölçümü
- zincir referral görevleri

---

### Öncelik 2.2 — Leaderboard
**Route**
- `GET /leaderboard/global`
- `GET /leaderboard/weekly`
- `GET /leaderboard/referral`

**Mantık**
- fraud filtreli sıralama
- cache
- score türleri

---

### Öncelik 2.3 — Notification / Engagement
**Route**
- `GET /notifications/preferences`
- `POST /notifications/preferences`
- `POST /admin/campaigns/create`

**Worker**
- energy full nudges
- daily hazır nudges
- boost expired nudges
- churn risk nudges

---

### Öncelik 2.4 — Tutorial / Onboarding
**Mantık**
- ilk 3 dakika akışı
- ilk görev zinciri
- ilk referral teşviki
- ilk upgrade yönlendirmesi

### Faz 2 Çıkış Kriteri
- kullanıcı geri dönüyor
- referral çalışıyor
- leaderboard var
- görev zinciri bitince boşluk oluşmuyor

---

## Faz 3 — Güvenlik ve Ekonomi Kontrolü

### Öncelik 3.1 — Transaction Ledger
Her ekonomi hareketi loglanmalı:
- tap
- passive claim
- purchase
- mission reward
- daily reward
- referral reward
- admin adjustment
- payout preparation

**Tablolar**
- `WalletTransaction`
- `EconomyEventLog`
- `AdminActionLog`

---

### Öncelik 3.2 — Idempotency ve Replay Koruması
Özellikle:
- daily claim
- payment confirm
- mission claim
- shop purchase

---

### Öncelik 3.3 — Advanced Anti-Cheat
- tap spam detection
- impossible progression
- cluster abuse
- referral ring detection
- suspicious score
- shadow ban / soft lock

---

### Öncelik 3.4 — Admin Düzeltme Araçları
- balance edit
- force mission complete
- force ban / unban
- suspicious review
- payout review

### Faz 3 Çıkış Kriteri
- ekonomi izlenebiliyor
- abuse durumları yakalanıyor
- admin manuel müdahale yapabiliyor

---

## Faz 4 — Para ve Ödül Katmanı

### Öncelik 4.1 — Reward Balance Ayrımı
Ayrı tutulmalı:
- `coins`
- `adnBalance`
- `eligibleRewardBalance`
- `lockedRewardBalance`
- `withdrawnTotal`

---

### Öncelik 4.2 — Withdrawal Lifecycle
**Route**
- `POST /withdrawals/request`
- `GET /withdrawals/history`
- `POST /admin/payouts/:id/approve`
- `POST /admin/payouts/:id/reject`

**Durumlar**
- pending
- under_review
- approved
- sent
- rejected
- reversed

---

### Öncelik 4.3 — Stars / Premium
- Stars ürün listesi
- payment webhook
- purchase fulfillment
- premium-only görevler
- premium-only boosts

---

### Öncelik 4.4 — Airdrop Engine
- snapshot
- weight score
- anti-sybil filters
- claim amount
- vesting gerekiyorsa vesting

### Faz 4 Çıkış Kriteri
- premium satışlar çalışıyor
- kontrollü payout akışı var
- airdrop eligibility ölçülebiliyor

---

## Faz 5 — Canlı Operasyon ve Ölçüm

### Öncelik 5.1 — Analytics
Ölç:
- D1 / D7 retention
- ARPPU
- quest completion rate
- referral conversion
- notification return rate
- energy full conversion
- daily streak survival

---

### Öncelik 5.2 — A/B Test
Test edilecekler:
- fiyatlar
- görev zorluğu
- reward büyüklüğü
- onboarding
- push metinleri

---

### Öncelik 5.3 — Event System
- x2 tap weekend
- referral week
- premium chest day
- airdrop warmup week
- reactivation campaign

---

### Öncelik 5.4 — Worker/Cron Altyapısı
- passive income backfill
- notification worker
- fraud scoring worker
- auto-expire boosts
- leaderboard cache refresh
- mission refresh worker

### Faz 5 Çıkış Kriteri
- oyun optimize edilebilir hale gelir
- canlı etkinlikler yönetilebilir
- retention ve gelir metrikleri görülebilir

---

# Tavsiye Edilen Uygulama Sırası

1. Repo temizlik + deploy
2. Profile/state
3. Tap engine
4. Passive income
5. Shop/upgrade
6. Level/unlocks
7. Missions
8. Daily reward
9. Referral
10. Leaderboard
11. Ledger
12. Anti-cheat advanced
13. Notifications
14. Admin correction tools
15. Premium/Stars
16. Payout layer
17. Airdrop engine
18. Analytics
19. A/B testing
20. Event system

---

# Faz Bazlı Zip Planı

## Zip 1 — Core API Kit
- profile
- tap
- income
- shop
- level
- missions
- daily

## Zip 2 — Growth Kit
- referral
- leaderboard
- onboarding
- notifications

## Zip 3 — Control Kit
- ledger
- anti-cheat advanced
- admin correction tools
- idempotency

## Zip 4 — Monetization Kit
- stars
- premium boosts
- reward balance split
- withdrawal lifecycle

## Zip 5 — Live Ops Kit
- analytics
- ab testing
- event system
- workers
