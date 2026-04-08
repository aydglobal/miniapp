# ADN Full Game Design Bundle

Bu paket, ADN tap-to-earn oyununun ekonomi ve ilerleme sistemini doğrudan kullanabilmen için tek yerde toplar.

## İçerik

- `economy/adn_economy_config.json`  
  Ana kontrol değerleri ve meta özet.
- `economy/levels.json`  
  Level 1-50 için XP, tap reward, enerji, regen, offline cap ve airdrop weight değerleri.
- `economy/feature_unlocks.json`  
  Hangi seviye hangi sistemi açıyor.
- `economy/upgrades.json`  
  20 upgrade kartının temel parametreleri.
- `economy/upgrade_tiers.json`  
  Her kart için tier 1-15 maliyet, saatlik ADN, payback ve verim skorları.
- `economy/referral_quests.json`  
  Referral görev zinciri.
- `economy/mission_engine.json`  
  Kullanıcı segmentine göre sonraki görev önerileri.
- `backend/postgres_schema.sql`  
  Oyun ekonomisi ve runtime tabloları.
- `backend/seed.sql`  
  SQL config seed dosyası.
- `backend/adnEconomy.constants.ts`  
  TypeScript sabitleri.
- `backend/economy.service.example.ts`  
  Backend servis kullanım örneği.
- `frontend/shop_cards.json`  
  Shop ekranı için kart verisi.
- `frontend/level_unlock_map.json`  
  Frontend seviye ekranı için sade unlock map.
- `adn_tap_to_earn_progression_model.xlsx`  
  Orijinal dengeleme workbook'u.

## Kısa tasarım özeti

- Erken oyun hızlı akar: Tap Engine, GPU Cluster ve temel retention unlock'ları erken açılır.
- Orta oyun seçim baskısı yaratır: payback süresi uzar ama category sinerjileri artar.
- Geç oyun aspirasyon odaklıdır: maliyetler daha agresif yükselir, ama social + exchange + research kartları büyümeyi korur.
- Referral kalitesi sayıya tercih edilir: aktif referral, streak, distinct device ve anti-abuse kontrolleri zorunlu.
- Dynamic missions, kullanıcı segmentine göre yeni görev önerir.

## Önerilen backend entegrasyonu

1. `backend/postgres_schema.sql` çalıştır.
2. `backend/seed.sql` çalıştır.
3. `backend/adnEconomy.constants.ts` dosyasını servis katmanına al.
4. Shop ekranında `frontend/shop_cards.json` kullan.
5. Level ekranında `frontend/level_unlock_map.json` kullan.
6. Referral görevleri tamamlandıkça `mission_engine.json` ile yeni görev üret.

## Kritik notlar

- ADN burada oyun içi ekonomi birimidir.
- Gerçek token, payout veya airdrop claim için fraud review, snapshot ve compliance katmanı ayrı tutulmalı.
- Eğer canlı economy balance değiştirilecekse önce workbook üzerinde test etmen en güvenlisidir.

## Önemli KPI hedefleri

- Starter average payback: yaklaşık 3-7 saat bandı
- Midgame average payback: yaklaşık 8-20 saat bandı
- Endgame kartları: daha uzun geri ödeme, daha yüksek aspirasyon
- Referral ödülleri: ham davetten çok retained referral odaklı
