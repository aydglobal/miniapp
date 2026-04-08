# 1. Tap Hissi

Amaç: her tıklamanın anlık ve tatmin edici hissettirmesi.

## Zorunlu öğeler
- Tap anında scale animation
- Floating reward text (`+1 ADN`, `CRIT x5`)
- Haptic feedback
- Crit olduğunda renk ve ses değişimi
- Combo meter
- Coin burst particle

## Önerilen akış
1. Kullanıcı tap yapar
2. UI anında optimistic reward gösterir
3. Arka planda API'ye gönderilir
4. Server sonucu ile reconcile edilir

## Combo tasarımı
- 0-4 tap: no combo
- 5-14 tap: x1.15
- 15-29 tap: x1.35
- 30-49 tap: x1.7
- 50+: x2.2
- 2.2 saniye tap gelmezse combo reset

## Crit tasarımı
- Base crit chance: %4
- Upgrade ve event ile %12'ye kadar çıkabilir
- Crit multiplier: x4.5
