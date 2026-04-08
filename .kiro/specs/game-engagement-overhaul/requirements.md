# Gereksinimler Dokümanı

## Giriş

ADN Arena, Telegram Mini App platformunda çalışan bir tap-to-earn oyunudur. Bu özellik paketi oyunu daha sürükleyici, dinamik ve bağımlılık yapıcı hale getirmeyi hedefler. Kapsam üç ana eksende toplanmaktadır:

1. **Görsel Tema Yenileme** — Mevcut renk paletini daha canlı, oyun atmosferine uygun tonlara taşımak; arka plan, kart ve buton stillerini güncellemek.
2. **Ekran Düzeni Optimizasyonu** — Tap ekranını ve sekme yapısını kullanıcıyı sıkmayacak, odaklanmayı artıracak biçimde yeniden düzenlemek.
3. **Oyun Döngüsü Derinleştirme** — Combo sistemi, streak görselleştirme, anlık geri bildirim katmanları ve ödül sürprizi mekanikleri ekleyerek oyuncuyu ekranda tutmak.

---

## Sözlük

- **TapCore**: Oyuncunun dokunduğu ana tap butonu ve çevresi (`game-tapper` bölgesi).
- **Combo**: Ardışık tap vuruşlarının oluşturduğu çarpan zinciri.
- **Streak**: Günlük oturum sürekliliği sayacı.
- **RewardBurst**: Tap veya ödül anında ekranda beliren anlık puan animasyonu.
- **Ripple**: Tap noktasında yayılan dokunma dalgası efekti.
- **EnergyBar**: Oyuncunun mevcut enerji seviyesini gösteren ilerleme çubuğu.
- **DockBar**: Ekranın altındaki sekme navigasyon çubuğu.
- **HeroSection**: Tap ekranının üst kısmındaki istatistik ve aksiyon kartları bölgesi.
- **FeedTicker**: Canlı oyun mesajlarını döngüsel olarak gösteren bilgi bandı.
- **ImpactState**: Tap, claim, upgrade veya reboot anında tetiklenen kısa süreli görsel durum.
- **SignalCard**: İstatistik ve durum bilgisi gösteren küçük kart bileşeni.
- **ADN_Arena**: Uygulamanın tamamı.
- **UI_System**: `apps/web/src/styles.css` ve React bileşenlerinden oluşan ön yüz katmanı.
- **TapEngine**: `apps/api/src/services/game.service.ts` içindeki tap işleme mantığı.
- **ComboEngine**: Combo çarpanını hesaplayan ve yöneten istemci tarafı modül.
- **AnimationLayer**: CSS animasyonları ve React state ile yönetilen görsel efekt katmanı.

---

## Gereksinimler

### Gereksinim 1: Canlı Renk Paleti ve Tema Sistemi

**Kullanıcı Hikayesi:** Bir oyuncu olarak, oyunun renklerinin canlı ve dinamik hissettirmesini istiyorum; böylece ekrana bakmak beni motive etsin ve oyun atmosferini hissedeyim.

#### Kabul Kriterleri

1. THE UI_System SHALL `--adn-bg` değişkenini `#0a0618` olarak güncellemeli ve arka plan gradyanını daha derin, daha yoğun mor-siyah tonlarına taşımalıdır.
2. THE UI_System SHALL `--adn-gold` değişkenini `#ffdd00`, `--adn-cyan` değişkenini `#00f5ff`, `--adn-pink` değişkenini `#ff2db4` ve `--adn-violet` değişkenini `#8b5cf6` olarak güncelleyerek renk doygunluğunu artırmalıdır.
3. THE UI_System SHALL panel arka planlarını (`--adn-panel`) `rgba(20, 12, 50, 0.88)` değerine güncelleyerek kontrast oranını artırmalıdır.
4. WHEN bir kart veya buton hover durumuna geçtiğinde, THE UI_System SHALL ilgili bileşenin accent renginde `0 0 18px` yarıçaplı bir glow efekti uygulamalıdır.
5. THE UI_System SHALL `game-button` sınıfına `background: linear-gradient(135deg, var(--adn-violet), var(--adn-blue))` gradyanı ve `box-shadow: 0 0 20px rgba(139, 92, 246, 0.45)` glow efekti eklemelidir.
6. THE UI_System SHALL `game-button-gold` sınıfına `background: linear-gradient(135deg, #ffdd00, #ff9500)` gradyanı ve `box-shadow: 0 0 20px rgba(255, 221, 0, 0.5)` glow efekti eklemelidir.
7. WHERE `--adn-cyan` rengi kullanılan bileşenlerde, THE UI_System SHALL `text-shadow: 0 0 12px rgba(0, 245, 255, 0.6)` efekti uygulamalıdır.
8. THE UI_System SHALL `body` arka planını daha yoğun ve katmanlı bir radial gradient ile güncellemeli; turuncu ve cyan orb'ların opaklığını en az `0.6` seviyesine çıkarmalıdır.

---

### Gereksinim 2: TapCore Görsel Güçlendirme

**Kullanıcı Hikayesi:** Bir oyuncu olarak, tap butonuna her dokunduğumda güçlü bir görsel ve haptik geri bildirim almak istiyorum; böylece her tap'in anlamlı hissettirdiğini görebiliyim.

#### Kabul Kriterleri

1. WHEN oyuncu tap butonuna dokunduğunda, THE AnimationLayer SHALL `scale(0.94)` ile `scale(1.0)` arasında 120ms süreli bir "punch" animasyonu oynatmalıdır.
2. WHEN oyuncu tap butonuna dokunduğunda, THE AnimationLayer SHALL dokunma noktasından dışa doğru yayılan, 600ms içinde `opacity: 0`'a ulaşan bir Ripple efekti oluşturmalıdır.
3. WHEN oyuncu tap butonuna dokunduğunda, THE AnimationLayer SHALL dokunma noktasından yukarı doğru hareket eden ve 900ms içinde kaybolan bir RewardBurst etiketi göstermelidir.
4. THE AnimationLayer SHALL `game-tapper__halo` elementine sürekli dönen ve nabız atan bir animasyon uygulamalı; bu animasyon 3 saniyelik döngüde `opacity: 0.4` ile `opacity: 0.9` arasında geçiş yapmalıdır.
5. WHILE enerji seviyesi `%20`'nin altındayken, THE AnimationLayer SHALL `game-tapper__halo` elementinin rengini kırmızı-turuncu tonuna (`rgba(255, 60, 0, 0.6)`) geçirmeli ve titreşim animasyonu eklemelidir.
6. WHEN kritik vuruş (criticalHit) gerçekleştiğinde, THE AnimationLayer SHALL ekranı 80ms boyunca `rgba(255, 45, 180, 0.15)` rengiyle flash yapmalı ve RewardBurst etiketini `font-size: 36px` ile göstermelidir.
7. THE AnimationLayer SHALL tap butonunun etrafına dönen 4 adet parçacık (particle) eklemeli; bu parçacıklar `--adn-cyan` ve `--adn-gold` renklerinde olmalı ve 6 saniyelik döngüde yörüngelerini tamamlamalıdır.
8. IF enerji sıfıra ulaştığında, THEN THE AnimationLayer SHALL tap butonunu `opacity: 0.4` seviyesine düşürmeli ve "Enerji dolana kadar bekle" mesajını göstermelidir.

---

### Gereksinim 3: Combo Çarpan Sistemi

**Kullanıcı Hikayesi:** Bir oyuncu olarak, hızlı ve ardışık tap yaptığımda combo çarpanının artmasını istiyorum; böylece ritimli oynamak beni daha fazla ödüllendirsin.

#### Kabul Kriterleri

1. THE ComboEngine SHALL ardışık tap'ler arasındaki süreyi takip etmeli; iki tap arasındaki süre `1200ms`'yi geçmediği sürece combo sayacını artırmalıdır.
2. WHEN combo sayacı `5`'e ulaştığında, THE ComboEngine SHALL `x1.5` çarpanı uygulamalı ve ekranda "COMBO x1.5" etiketi göstermelidir.
3. WHEN combo sayacı `10`'a ulaştığında, THE ComboEngine SHALL `x2.0` çarpanı uygulamalı ve ekranda "COMBO x2.0" etiketi göstermelidir.
4. WHEN combo sayacı `20`'ye ulaştığında, THE ComboEngine SHALL `x3.0` çarpanı uygulamalı ve ekranda "COMBO x3.0" etiketi göstermelidir.
5. WHEN iki tap arasındaki süre `1200ms`'yi geçtiğinde, THE ComboEngine SHALL combo sayacını sıfırlamalı ve çarpanı `x1.0`'a döndürmelidir.
6. THE AnimationLayer SHALL aktif combo çarpanını TapCore'un üst kısmında, `font-family: var(--adn-title-font)` ile büyük ve parlak biçimde göstermelidir.
7. WHEN combo sayacı sıfırlandığında, THE AnimationLayer SHALL combo göstergesini 400ms içinde `opacity: 0`'a düşürerek kaybetmelidir.
8. THE ComboEngine SHALL combo çarpanını yalnızca istemci tarafında hesaplamalı; sunucuya gönderilen tap isteği mevcut `tapPower` değerini kullanmaya devam etmelidir.

---

### Gereksinim 4: EnergyBar ve İlerleme Görselleştirme

**Kullanıcı Hikayesi:** Bir oyuncu olarak, enerji seviyemi ve oyun ilerlememi tek bakışta anlayabilmek istiyorum; böylece ne zaman tap yapabileceğimi ve ne kadar ilerlediğimi hemen görebileyim.

#### Kabul Kriterleri

1. THE UI_System SHALL EnergyBar'ı `height: 16px` ve `border-radius: 999px` ile daha belirgin hale getirmeli; doluluk rengi `linear-gradient(90deg, var(--adn-cyan), var(--adn-blue))` olmalıdır.
2. THE UI_System SHALL EnergyBar doluluk animasyonunu `transition: width 300ms ease` ile akıcı hale getirmelidir.
3. WHILE enerji `%100`'de olduğunda, THE AnimationLayer SHALL EnergyBar üzerinde soldan sağa kayan parlak bir "shimmer" efekti oynatmalıdır.
4. WHILE enerji `%20`'nin altındayken, THE UI_System SHALL EnergyBar rengini `linear-gradient(90deg, #ff3c00, #ff7a00)` olarak değiştirmeli ve `animation: pulse 1s ease-in-out infinite` uygulamalıdır.
5. THE UI_System SHALL enerji değerini `{mevcut}/{maksimum}` formatında EnergyBar'ın sağ tarafında göstermelidir.
6. THE UI_System SHALL seviye ilerleme çubuğunu (level XP bar) EnergyBar'ın altına eklemeli; doluluk rengi `linear-gradient(90deg, var(--adn-gold), var(--adn-orange))` olmalıdır.
7. WHEN seviye atlandığında, THE AnimationLayer SHALL seviye göstergesini 600ms boyunca `scale(1.3)` ile büyütmeli ve altın rengi bir glow efekti uygulamalıdır.

---

### Gereksinim 5: Ekran Düzeni ve Sekme Yapısı Optimizasyonu

**Kullanıcı Hikayesi:** Bir oyuncu olarak, ekranın düzenli ve odaklanmış hissettirmesini istiyorum; böylece hangi aksiyonu yapacağımı hemen anlayabileyim ve gereksiz bilgilerle bunalmayayım.

#### Kabul Kriterleri

1. THE UI_System SHALL `mine` sekmesinde TapCore'u ekranın merkezine almalı; HeroSection'ı TapCore'un altına taşımalı ve varsayılan görünümde yalnızca TapCore ile EnergyBar görünür olmalıdır.
2. THE UI_System SHALL DockBar'ı `height: 72px` ve `border-radius: 28px 28px 0 0` ile yeniden tasarlamalı; aktif sekme butonu `background: linear-gradient(180deg, var(--adn-violet), var(--adn-blue))` ile vurgulanmalıdır.
3. THE UI_System SHALL DockBar aktif sekme ikonunu `scale(1.15)` ile büyütmeli ve `box-shadow: 0 0 16px rgba(139, 92, 246, 0.6)` glow efekti eklemelidir.
4. THE UI_System SHALL `game-header` bölümünü kompakt tutmalı; yalnızca logo, sıra (#rank) ve enerji göstergesi görünür olmalıdır.
5. THE UI_System SHALL `game-hero__intro` grid düzenini mobil ekranlarda (`max-width: 480px`) tek sütuna (`grid-template-columns: 1fr`) düşürmelidir.
6. THE UI_System SHALL SignalCard bileşenlerini `mine` sekmesinde yatay kaydırılabilir bir satır (`overflow-x: auto; display: flex; gap: 12px`) içinde göstermelidir.
7. THE UI_System SHALL FeedTicker'ı `game-header` ile TapCore arasına yerleştirmeli; `font-size: 13px` ve `padding: 8px 14px` ile kompakt tutmalıdır.
8. THE UI_System SHALL `boosts`, `tasks`, `wallet`, `social` ve `settings` sekmelerinde tam genişlikte içerik alanı kullanmalı; her sekmenin üst kısmında sekme başlığı ve kısa açıklama göstermelidir.

---

### Gereksinim 6: Ödül ve Başarı Geri Bildirim Sistemi

**Kullanıcı Hikayesi:** Bir oyuncu olarak, her ödül ve başarı anında tatmin edici görsel ve ses geri bildirimi almak istiyorum; böylece ilerlememin fark edildiğini hissedeyim.

#### Kabul Kriterleri

1. WHEN günlük ödül talep edildiğinde, THE AnimationLayer SHALL ekranın ortasında 1.5 saniye boyunca altın rengi bir "burst" animasyonu ve ödül miktarını gösteren büyük bir etiket göstermelidir.
2. WHEN görev tamamlandığında, THE AnimationLayer SHALL görev kartının üzerinde yeşil renkte bir onay işareti animasyonu ve "+XP" etiketi göstermelidir.
3. WHEN seviye atlandığında, THE AnimationLayer SHALL tam ekran bir "LEVEL UP" overlay'i göstermeli; bu overlay `--adn-gold` rengi ile 1.2 saniye boyunca görünür olmalı ve ardından kaybolmalıdır.
4. WHEN chest açıldığında, THE AnimationLayer SHALL mevcut `ChestRevealSequence` bileşenini kullanmalı ve nadir (rare ve üzeri) chest'ler için arka plana parçacık efekti eklemelidir.
5. WHEN boost satın alındığında, THE AnimationLayer SHALL boost kartının üzerinde `--adn-cyan` rengi ile 600ms süreli bir "activate" animasyonu oynatmalıdır.
6. THE UI_System SHALL `game-status-banner` bileşenini ekranın üst kısmında sabit konumda (`position: fixed; top: 0`) göstermeli; arka planı `rgba(20, 12, 50, 0.95)` ve `backdrop-filter: blur(12px)` olmalıdır.
7. IF bir işlem başarısız olduğunda, THEN THE UI_System SHALL hata mesajını kırmızı-turuncu tonunda (`--adn-orange`) ve sol kenarda kırmızı bir çizgi ile göstermelidir.
8. THE AnimationLayer SHALL RewardBurst etiketlerini farklı tonlarda göstermeli: ADN ödülleri altın, XP ödülleri cyan, kritik vuruşlar pembe, boost aktivasyonları mor renkte olmalıdır.

---

### Gereksinim 7: Streak ve Günlük Bağlılık Döngüsü

**Kullanıcı Hikayesi:** Bir oyuncu olarak, her gün geri dönmem için güçlü görsel teşvikler görmek istiyorum; böylece streak'imi kırmamak için motive olayım.

#### Kabul Kriterleri

1. THE UI_System SHALL günlük streak sayacını `game-header` bölümünde ateş ikonu ile birlikte belirgin biçimde göstermeli; streak `7` veya üzerindeyse `--adn-gold` rengi ile vurgulanmalıdır.
2. WHEN streak `7`'nin katlarına ulaştığında (7, 14, 21...), THE AnimationLayer SHALL özel bir "milestone" animasyonu oynatmalı ve "🔥 {N} GÜN STREAK" etiketi göstermelidir.
3. THE UI_System SHALL günlük ödül kartını (`game-daily-card`) `tasks` sekmesinin en üstüne yerleştirmeli; talep edilebilir durumdayken `border: 2px solid var(--adn-gold)` ve nabız animasyonu uygulanmalıdır.
4. WHILE günlük ödül talep edilebilir durumdayken, THE UI_System SHALL DockBar'daki `tasks` sekmesi ikonunun üzerine kırmızı bir bildirim noktası (`width: 8px; height: 8px; background: #ff3c00`) göstermelidir.
5. THE UI_System SHALL son 7 günlük streak geçmişini küçük daire ikonlarla göstermeli; tamamlanan günler `--adn-gold` rengi, tamamlanmayanlar `rgba(255,255,255,0.2)` rengi ile gösterilmelidir.
6. WHEN günlük ödül talep edildiğinde, THE AnimationLayer SHALL streak sayacını 400ms içinde `scale(1.4)` ile büyütmeli ve ardından normal boyutuna döndürmelidir.

---

### Gereksinim 8: Performans ve Erişilebilirlik

**Kullanıcı Hikayesi:** Bir oyuncu olarak, oyunun Telegram Mini App içinde akıcı çalışmasını istiyorum; böylece animasyonlar ve efektler oyun deneyimini yavaşlatmasın.

#### Kabul Kriterleri

1. THE UI_System SHALL tüm CSS animasyonlarını `transform` ve `opacity` özellikleriyle sınırlandırmalı; `width`, `height` veya `top/left` gibi layout tetikleyen özellikler animasyonlarda kullanılmamalıdır.
2. THE UI_System SHALL `will-change: transform` özelliğini yalnızca aktif animasyon süresince uygulamalı; animasyon bitiminde kaldırmalıdır.
3. THE AnimationLayer SHALL aynı anda ekranda en fazla `8` adet RewardBurst etiketi bulundurmalı; bu sınır aşıldığında en eski etiket kaldırılmalıdır.
4. THE UI_System SHALL `@media (prefers-reduced-motion: reduce)` sorgusunu desteklemeli; bu tercih aktifken tüm dekoratif animasyonlar devre dışı bırakılmalı, yalnızca işlevsel geçişler (`opacity`, `visibility`) korunmalıdır.
5. THE UI_System SHALL tüm etkileşimli butonlara `aria-label` veya görünür metin etiketi sağlamalıdır.
6. THE UI_System SHALL renk kontrastını WCAG AA standardına uygun tutmalı; metin rengi ile arka plan arasındaki kontrast oranı en az `4.5:1` olmalıdır.
7. THE UI_System SHALL Telegram Mini App viewport kısıtlamalarına uygun olmalı; `min-height: 100vh` yerine `min-height: var(--tg-viewport-height, 100vh)` kullanmalıdır.
8. IF cihaz düşük performanslıysa (60fps altında), THEN THE AnimationLayer SHALL parçacık efektlerini ve arka plan orb animasyonlarını otomatik olarak devre dışı bırakmalıdır.

---

### Gereksinim 9: Boost ve Market Ekranı Görsel İyileştirme

**Kullanıcı Hikayesi:** Bir oyuncu olarak, boost ve market ekranlarının çekici ve anlaşılır görünmesini istiyorum; böylece hangi yükseltmeyi alacağıma kolayca karar verebileyim.

#### Kabul Kriterleri

1. THE UI_System SHALL boost kartlarını `border: 1px solid rgba(139, 92, 246, 0.3)` ve `background: linear-gradient(180deg, rgba(139, 92, 246, 0.12), rgba(20, 12, 50, 0.9))` ile stilize etmelidir.
2. WHEN bir boost aktifken, THE UI_System SHALL ilgili boost kartına `border-color: var(--adn-cyan)` ve `box-shadow: 0 0 14px rgba(0, 245, 255, 0.3)` uygulamalıdır.
3. THE UI_System SHALL market kartlarını (`shop_cards`) ikon, başlık, mevcut seviye, saatlik gelir artışı ve yükseltme maliyeti bilgilerini net biçimde gösterecek şekilde düzenlemelidir.
4. THE UI_System SHALL satın alınabilir kartları üst sıraya, kilitli kartları alt sıraya yerleştirmeli; kilitli kartlar `opacity: 0.5` ile gösterilmelidir.
5. WHEN market kartı yükseltildiğinde, THE AnimationLayer SHALL kart üzerinde 500ms süreli bir "upgrade flash" animasyonu oynatmalı; kart `scale(1.05)` ile büyümeli ve ardından normal boyutuna dönmelidir.
6. THE UI_System SHALL aktif boost'ların kalan süresini `game-active-boosts` bölümünde `MM:SS` formatında göstermeli ve süre `60 saniye`'nin altına düştüğünde kırmızı renkte vurgulamalıdır.

---

### Gereksinim 10: Sosyal ve Referral Ekranı Görsel İyileştirme

**Kullanıcı Hikayesi:** Bir oyuncu olarak, arkadaşlarımı davet etmek ve liderlik tablosundaki konumumu görmek için çekici bir sosyal ekran görmek istiyorum.

#### Kabul Kriterleri

1. THE UI_System SHALL liderlik tablosu satırlarını sıralamaya göre renklendirmeli: 1. sıra `--adn-gold`, 2. sıra `rgba(192,192,192,0.8)`, 3. sıra `rgba(205,127,50,0.8)` rengi ile vurgulanmalıdır.
2. THE UI_System SHALL oyuncunun kendi sırasını liderlik tablosunda `border: 1px solid var(--adn-cyan)` ile vurgulamalıdır.
3. THE UI_System SHALL referral davet butonunu `game-button-gold` stiliyle ve "Arkadaşını Davet Et" etiketi ile göstermeli; buton tam genişlikte (`width: 100%`) olmalıdır.
4. THE UI_System SHALL referral kodunu kopyalanabilir bir metin alanında göstermeli; kopyalama sonrası "Kopyalandı!" mesajı 2 saniye boyunca gösterilmelidir.
5. THE UI_System SHALL syndicate (clan) bölümünü sosyal ekranın alt kısmında göstermeli; aktif syndicate varsa üye sayısı ve toplam skor görünür olmalıdır.
