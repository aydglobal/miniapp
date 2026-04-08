# ADN Gameplay Deepening Pack

Bu paket, tap-to-earn oyununun en kritik 5 katmanını derinleştirmek için hazırlanmıştır:

1. Tap hissi (animasyon + ses + feedback)
2. Chest + jackpot sistemi
3. Prestige + meta progression
4. Clan + rekabet güçlendirme
5. Event + FOMO sistemi

## İçerik
- `docs/` : tasarım ve dengeleme notları
- `backend/` : service ve config örnekleri
- `frontend/` : React/TSX bileşen iskeletleri
- `config/` : economy ve event json verileri

## Entegrasyon sırası
1. `tap_feedback` katmanını ekle
2. `chest_jackpot` servislerini bağla
3. prestige reset ve meta skill tree'yi aktif et
4. clan savaşları / haftalık leaderboard'ı aç
5. canlı event ve limited offer scheduler'ı çalıştır
