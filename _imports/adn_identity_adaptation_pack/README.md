# ADN Identity Adaptation Pack

Bu paket, hazırda kurduğun ADN tap-to-earn sistemini
"sıradan mining app" kimliğinden çıkarıp
"0'dan imparatorluğa giden cyber economy sim" kimliğine taşımak için hazırlanmıştır.

## Amaç
Var olan sistemleri bozmadan:
- isimleri
- UI metinlerini
- görev dilini
- progression fazlarını
- prestige / clan / chest kimliğini
- event isimlerini
- onboarding ve ana ekran yönlendirmelerini

ADN'nin yeni kimliğine uyarlamak.

## Yeni Kimlik
**ADN: Zero to Empire**
Slogan:
**Start with nothing. Own everything.**

## Paket İçeriği
- `docs/identity_upgrade_guide.md`
- `docs/narrative_lore.md`
- `config/phase_progression.json`
- `config/system_renames.json`
- `config/ui_copy_tr.json`
- `config/ui_copy_en.json`
- `config/mission_copy.json`
- `config/event_copy.json`
- `config/onboarding_copy.json`
- `config/smart_action_copy.json`
- `frontend/copy/identityCopy.ts`
- `frontend/copy/screenLabels.ts`
- `frontend/example/identityAdapter.example.ts`

## Entegrasyon Sırası
1. `system_renames.json` içindeki yeni isimleri frontend/backend label layer'ına bağla
2. `ui_copy_tr.json` ve `mission_copy.json` içeriğini ekranlara uygula
3. `phase_progression.json` ile oyuncu fazlarını görünür hale getir
4. prestige, clan, chest, event ekranlarında yeni terminolojiyi göster
5. onboarding ve smart action kutusunu yeni kimliğe göre yeniden yaz
