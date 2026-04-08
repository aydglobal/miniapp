p# Uygulama Planı: Game Engagement Overhaul

## Genel Bakış

Bu plan, ADN Arena Telegram Mini App'inin görsel temasını 1win Token ve Hamster Combat tarzına taşır. Tüm değişiklikler `apps/web/src/` altında gerçekleşir; mevcut CSS sınıfları silinmez, yalnızca güncellenir ve yeni sınıflar eklenir. Sunucu tarafı (`apps/api/`) bu kapsamda değiştirilmez.

## Görevler

- [x] 1. CSS tema değişkenleri ve arka plan güncellemesi
  - `apps/web/src/styles.css` dosyasında `:root` bloğundaki renk değişkenlerini güncelle
  - `--adn-bg` → `#0a0618`, `--adn-gold` → `#ffdd00`, `--adn-cyan` → `#00f5ff`, `--adn-pink` → `#ff2db4`, `--adn-violet` → `#8b5cf6`
  - `--adn-panel` → `rgba(20, 12, 50, 0.88)` olarak güncelle
  - `body` arka plan gradyanını daha derin mor-siyah tonlara taşı; orb opaklıklarını en az `0.6`'ya çıkar
  - `game-shell::before` ve `game-shell::after` pseudo-element renklerini yeni palete uyarla
  - _Gereksinimler: 1.1, 1.2, 1.3, 1.8_

  - [ ] 1.1 CSS değişken smoke testi yaz
    - `getComputedStyle(document.documentElement)` ile `--adn-bg`, `--adn-gold`, `--adn-cyan` değerlerinin beklenen değerlere eşit olduğunu doğrula
    - _Gereksinimler: 1.1, 1.2_

- [x] 2. Buton, kart ve hover glow stilleri güncellemesi
  - `apps/web/src/styles.css` dosyasında `game-button` sınıfına `linear-gradient(135deg, var(--adn-violet), var(--adn-blue))` gradyanı ve `box-shadow: 0 0 20px rgba(139, 92, 246, 0.45)` ekle
  - `game-button-gold` sınıfına `linear-gradient(135deg, #ffdd00, #ff9500)` gradyanı ve `box-shadow: 0 0 20px rgba(255, 221, 0, 0.5)` ekle
  - `game-signal-card`, `game-hero-stat`, `game-panel` hover durumlarına `0 0 18px` yarıçaplı accent glow ekle
  - `--adn-cyan` kullanan bileşenlere `text-shadow: 0 0 12px rgba(0, 245, 255, 0.6)` uygula
  - _Gereksinimler: 1.4, 1.5, 1.6, 1.7_

- [x] 3. Animasyon keyframe'leri ekleme
  - `apps/web/src/styles.css` dosyasına aşağıdaki yeni `@keyframes` bloklarını ekle (mevcut olanlar silinmez):
    - `gameTapPunch`: `scale(0.94)` → `scale(1.0)`, 120ms
    - `gameRippleOut`: dışa yayılan dalga, 600ms `opacity: 0`'a ulaşır
    - `gameHaloPulse`: `opacity: 0.4` ↔ `opacity: 0.9`, 3s döngü
    - `gameCoreParticleOrbit`: 4 parçacık için 6s yörünge döngüsü
    - `gameShimmer`: soldan sağa kayan parlak efekt, EnergyBar için
    - `gameLevelUpBurst`: tam ekran altın glow, 1.2s
    - `gameStreakMilestone`: streak sayacı `scale(1.4)` → normal, 400ms
    - `gameUpgradeFlash`: kart `scale(1.05)` → normal, 500ms
    - `gameComboFadeOut`: combo göstergesi `opacity: 1` → `opacity: 0`, 400ms
  - _Gereksinimler: 2.1, 2.2, 2.4, 3.7, 4.3, 6.3, 7.6, 9.5_

- [x] 4. EnergyBar görsel iyileştirmesi
  - `apps/web/src/styles.css` dosyasına yeni `.game-energy-bar`, `.game-energy-bar--full`, `.game-energy-bar--danger` sınıfları ekle
  - `.game-energy-bar`: `height: 16px`, `border-radius: 999px`, doluluk rengi `linear-gradient(90deg, var(--adn-cyan), var(--adn-blue))`, `transition: width 300ms ease`
  - `.game-energy-bar--full`: shimmer animasyonu aktif (`gameShimmer` keyframe)
  - `.game-energy-bar--danger`: `linear-gradient(90deg, #ff3c00, #ff7a00)` + `animation: pulse 1s ease-in-out infinite`
  - `apps/web/src/pages/App.tsx` dosyasında `getEnergyVariant` yardımcı fonksiyonunu ekle ve EnergyBar render'ına CSS sınıfı olarak uygula
  - _Gereksinimler: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 4.1 `getEnergyVariant` için özellik testi yaz (Property 5)
    - **Özellik 5: EnergyBar durum sınıflandırması**
    - `fast-check` ile `fc.float({ min: 0, max: 100 })` üzerinde: `%100`'de `'full'`, `%20` altında `'danger'`, diğerlerinde `'normal'` döndürdüğünü doğrula
    - **Doğrular: Gereksinimler 4.3, 4.4**

  - [x] 4.2 `getEnergyVariant` için birim testleri yaz
    - `getEnergyVariant(100)` → `'full'`, `getEnergyVariant(19)` → `'danger'`, `getEnergyVariant(50)` → `'normal'`
    - _Gereksinimler: 4.3, 4.4_

- [x] 5. `useComboEngine` hook oluşturma
  - `apps/web/src/hooks/useComboEngine.ts` dosyasını oluştur
  - `comboCount`, `comboMultiplier`, `isActive` state'lerini yönet
  - `registerTap()`: son tap zamanını `useRef` ile sakla, 1200ms timeout ile combo sıfırla, her yeni tap'te önceki timeout'u iptal et
  - `getMultiplier(count)` saf fonksiyonu: `>=20` → `3.0`, `>=10` → `2.0`, `>=5` → `1.5`, `<5` → `1.0`
  - Bileşen unmount'ta `clearTimeout` çağır (bellek sızıntısı önleme)
  - Combo sayacı `Math.max(0, ...)` ile negatife düşmez
  - _Gereksinimler: 3.1, 3.2, 3.3, 3.4, 3.5, 3.8_

  - [x] 5.1 `getMultiplier` için özellik testi yaz (Property 2)
    - **Özellik 2: Combo çarpan monotonluğu**
    - `fast-check` ile `fc.integer({ min: 1, max: 100 })` üzerinde: `getMultiplier(n) >= getMultiplier(n-1)` her zaman doğru
    - **Doğrular: Gereksinimler 3.2, 3.3, 3.4**

  - [x] 5.2 Combo zaman penceresi için özellik testi yaz (Property 3)
    - **Özellik 3: Combo zaman penceresi invariantı**
    - `fast-check` ile `fc.integer({ min: 0, max: 2400 })` üzerinde: `<1200ms` → sayaç artar, `>=1200ms` → sayaç sıfırlanır
    - **Doğrular: Gereksinimler 3.1, 3.5**

  - [x] 5.3 `getMultiplier` için birim testleri yaz
    - `getMultiplier(0)` → `1.0`, `getMultiplier(5)` → `1.5`, `getMultiplier(10)` → `2.0`, `getMultiplier(20)` → `3.0`
    - _Gereksinimler: 3.2, 3.3, 3.4_

- [x] 6. `ComboDisplay` bileşeni oluşturma
  - `apps/web/src/components/ComboDisplay.tsx` dosyasını oluştur
  - Props: `multiplier: number`, `count: number`, `visible: boolean`
  - `visible === false` olduğunda `gameComboFadeOut` animasyonu ile 400ms fade-out
  - `font-family: var(--adn-title-font)` ile büyük ve parlak render
  - TapCore'un üst kısmında konumlandırılmak üzere `position: absolute` kullan
  - _Gereksinimler: 3.2, 3.3, 3.4, 3.6, 3.7_

- [x] 7. `LevelUpOverlay` bileşeni oluşturma
  - `apps/web/src/components/LevelUpOverlay.tsx` dosyasını oluştur
  - Props: `level: number`, `visible: boolean`, `onDone: () => void`
  - 1200ms görünür kalır, ardından `onDone` çağrılır
  - `gameLevelUpBurst` keyframe ile tam ekran altın glow efekti
  - `--adn-gold` rengi ile "LEVEL UP" ve seviye numarası göster
  - _Gereksinimler: 6.3_

  - [x] 7.1 `shouldShowLevelUp` için özellik testi yaz (Property 7)
    - **Özellik 7: Level up overlay tetiklenme koşulu**
    - `fast-check` ile `fc.integer` çiftleri üzerinde: `newLevel > prevLevel` → overlay gösterilmeli, aksi halde gösterilmemeli
    - **Doğrular: Gereksinim 6.3**

- [x] 8. App.tsx'e combo engine ve level-up overlay entegrasyonu
  - `apps/web/src/pages/App.tsx` dosyasını güncelle
  - `useComboEngine` hook'unu import et ve `handleTap` içinde `registerTap()` çağır
  - `ComboDisplay` bileşenini TapCore bölgesine ekle; `multiplier` ve `count` prop'larını combo engine'den al
  - `LevelUpOverlay` bileşenini ekle; `gameBus.on('level_up')` ile tetikle
  - `pushBurst` fonksiyonunu RewardBurst sınır kontrolü ile güncelle (max 8, en eski kaldır)
  - `getEnergyVariant` fonksiyonunu kullanarak EnergyBar'a dinamik CSS sınıfı uygula
  - `isStreakHighlighted` ve `isStreakMilestone` yardımcı fonksiyonlarını ekle
  - _Gereksinimler: 3.1–3.8, 6.3, 7.1, 7.2, 8.3_

  - [x] 8.1 RewardBurst liste sınırı için özellik testi yaz (Property 4)
    - **Özellik 4: RewardBurst liste sınırı**
    - `fast-check` ile `fc.integer({ min: 1, max: 50 })` üzerinde: ardışık burst eklemelerinde liste uzunluğu hiçbir zaman 8'i geçmez
    - **Doğrular: Gereksinim 8.3**

  - [x] 8.2 Ripple koordinat tutarlılığı için özellik testi yaz (Property 1)
    - **Özellik 1: Ripple koordinat tutarlılığı**
    - `fast-check` ile `fc.float` koordinat çiftleri üzerinde: `pushBurst` sonrası eklenen elemanın `x` ve `y` değerleri tap koordinatlarıyla eşleşir
    - **Doğrular: Gereksinimler 2.2, 2.3**

- [x] 9. Checkpoint — Temel testler geçiyor mu?
  - Tüm testlerin geçtiğini doğrula, sorular varsa kullanıcıya sor.

- [x] 10. DockBar aktif sekme stili güncellemesi
  - `apps/web/src/styles.css` dosyasında `.game-dock__button.is-active` sınıfını güncelle
  - Aktif sekme: `background: linear-gradient(180deg, var(--adn-violet), var(--adn-blue))`
  - Aktif ikon: `transform: scale(1.15)` + `box-shadow: 0 0 16px rgba(139, 92, 246, 0.6)`
  - DockBar yüksekliği: `height: 72px`, `border-radius: 28px 28px 0 0`
  - `.game-dock__badge` yeni sınıfı ekle: `width: 8px; height: 8px; background: #ff3c00; border-radius: 50%; position: absolute; top: 8px; right: 8px`
  - `apps/web/src/pages/App.tsx` dosyasında `daily.canClaim === true` iken tasks sekmesi butonuna `.game-dock__badge` ekle
  - _Gereksinimler: 5.2, 5.3, 7.4_

- [x] 11. Streak görselleştirme ve bildirim noktası
  - `apps/web/src/styles.css` dosyasına `.game-streak`, `.game-streak--highlighted`, `.game-streak-milestone` sınıfları ekle
  - Streak `>=7` iken `--adn-gold` rengi ile vurgulama
  - `gameStreakMilestone` keyframe'i streak milestone anında tetikle
  - `apps/web/src/pages/App.tsx` dosyasında `isStreakHighlighted` ve `isStreakMilestone` fonksiyonlarını header streak göstergesine uygula
  - Son 7 günlük streak geçmişi için küçük daire ikonları: tamamlanan `--adn-gold`, tamamlanmayan `rgba(255,255,255,0.2)`
  - _Gereksinimler: 7.1, 7.2, 7.5, 7.6_

  - [x] 11.1 Streak fonksiyonları için özellik testi yaz (Property 6)
    - **Özellik 6: Streak vurgulama eşiği**
    - `fast-check` ile `fc.integer({ min: 0, max: 365 })` üzerinde: `isStreakHighlighted` ve `isStreakMilestone` fonksiyonlarının tutarlı davrandığını doğrula
    - **Doğrular: Gereksinimler 7.1, 7.2**

  - [x] 11.2 Streak fonksiyonları için birim testleri yaz
    - `isStreakHighlighted(6)` → `false`, `isStreakHighlighted(7)` → `true`, `isStreakMilestone(7)` → `true`, `isStreakMilestone(8)` → `false`
    - _Gereksinimler: 7.1, 7.2_

- [x] 12. TapCore parçacık ve halo efektleri
  - `apps/web/src/styles.css` dosyasına `.game-core-particle` sınıfı ekle: `--adn-cyan` ve `--adn-gold` renklerinde, `gameCoreParticleOrbit` ile 6s yörünge
  - `.game-tapper__halo` animasyonunu `gameHaloPulse` ile güncelle: 3s döngü, `opacity: 0.4` ↔ `0.9`
  - Enerji `%20` altında iken halo rengini `rgba(255, 60, 0, 0.6)` olarak değiştiren `.game-tapper__halo--danger` sınıfı ekle
  - `apps/web/src/pages/App.tsx` dosyasında `CORE_PARTICLES` listesini render eden bölüme `.game-core-particle` sınıfını uygula
  - _Gereksinimler: 2.4, 2.5, 2.7_

- [x] 13. Boost ve market ekranı kart stilleri
  - `apps/web/src/styles.css` dosyasına `.game-boost-card`, `.game-boost-card--active` sınıfları ekle
  - `.game-boost-card`: `border: 1px solid rgba(139, 92, 246, 0.3)`, `background: linear-gradient(180deg, rgba(139, 92, 246, 0.12), rgba(20, 12, 50, 0.9))`
  - `.game-boost-card--active`: `border-color: var(--adn-cyan)`, `box-shadow: 0 0 14px rgba(0, 245, 255, 0.3)`
  - `gameUpgradeFlash` keyframe'ini market kartı yükseltme anında tetikle
  - Kilitli kartlar için `opacity: 0.5` uygula; satın alınabilir kartları üst sıraya yerleştir
  - `apps/web/src/pages/App.tsx` dosyasında `BoostsSection` render'ında yeni sınıfları uygula
  - _Gereksinimler: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 14. Sosyal ve referral ekranı görsel iyileştirmeleri
  - `apps/web/src/styles.css` dosyasına `.game-leaderboard-row--gold`, `.game-leaderboard-row--silver`, `.game-leaderboard-row--bronze`, `.game-leaderboard-row--self` sınıfları ekle
  - 1. sıra `--adn-gold`, 2. sıra `rgba(192,192,192,0.8)`, 3. sıra `rgba(205,127,50,0.8)` rengi
  - Oyuncunun kendi satırı: `border: 1px solid var(--adn-cyan)`
  - Referral davet butonu `game-button-gold` stili, tam genişlik (`width: 100%`)
  - Referral kodu kopyalama: 2 saniye "Kopyalandı!" mesajı için state ekle
  - `apps/web/src/pages/App.tsx` dosyasında `SocialSection` render'ında yeni sınıfları uygula
  - _Gereksinimler: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 15. Performans: düşük FPS tespiti ve reduced-motion desteği
  - `apps/web/src/styles.css` dosyasına `@media (prefers-reduced-motion: reduce)` bloğu ekle: tüm dekoratif animasyonları devre dışı bırak, yalnızca `opacity` ve `visibility` geçişlerini koru
  - `body[data-low-perf="true"] .game-tapper__halo, body[data-low-perf="true"] .game-core-particle { display: none; }` kuralını ekle
  - `apps/web/src/pages/App.tsx` dosyasına `requestAnimationFrame` döngüsü ile FPS ölçümü ekle; 60fps altında `document.body.setAttribute('data-low-perf', 'true')` çağır
  - `min-height: 100vh` kullanımlarını `min-height: var(--tg-viewport-height, 100vh)` ile değiştir
  - _Gereksinimler: 8.1, 8.2, 8.4, 8.7, 8.8_

- [x] 16. Final checkpoint — Tüm testler geçiyor mu?
  - Tüm testlerin geçtiğini doğrula, sorular varsa kullanıcıya sor.

## Notlar

- `*` ile işaretli görevler isteğe bağlıdır; MVP için atlanabilir
- Her görev önceki adımlar üzerine inşa edilir; sıra önemlidir
- Tüm mevcut CSS sınıfları korunur, yalnızca değerler güncellenir veya yeni sınıflar eklenir
- Combo çarpanı yalnızca istemci tarafında görsel amaçlıdır; sunucu payload'ı değişmez
- Özellik testleri `fast-check` kütüphanesi ile yazılır (minimum 100 iterasyon)


