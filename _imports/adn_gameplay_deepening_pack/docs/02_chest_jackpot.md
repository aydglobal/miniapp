# 2. Chest + Jackpot Sistemi

## Neden gerekli?
- Değişken ödül oranı dopamin loop üretir
- Oyuncuya "bir daha vurursam büyük ödül gelebilir" hissi verir

## Chest türleri
- Free Chest: 4 saatte bir
- Mission Chest: görev tamamlanınca
- Referral Chest: kaliteli referral sonrası
- Premium Chest: Stars ile
- Clan Chest: ortak katkı sonrası

## Nadirlikler
- Common 55%
- Rare 25%
- Epic 12%
- Legendary 6%
- Mythic 2%

## Jackpot
Ayrı bir pool:
- Jackpot trigger chance: %0.35
- Ödül: 30 dk x2 income, premium shard, event ticket, ADN bundle

## Güvenli tasarım
- Loot roll server-side
- Chest sonuçları loglanmalı
- Aynı chest iki kez açılamamalı (idempotency key)
