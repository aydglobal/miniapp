# ADN Ultra Pro UI + Gameplay Master Blueprint

## Amaç

Bu doküman, ADN projesini sıradan bir Web3 landing veya basit tap-to-earn deneyiminden çıkarıp kendi kimliği olan, premium görünen, güven veren, uzun vadeli retention üreten ve görsel olarak ayırt edilebilir bir dijital ekonomi ürününe dönüştürmek için hazırlanmıştır.

Buradaki hedef sadece estetik değildir. Hedef; kullanıcıya ilk anda güven vermek, ilk kullanımda netlik sağlamak, kısa oturumlarda tatmin duygusu oluşturmak, orta vadede alışkanlık yaratmak ve uzun vadede sosyal/statü odaklı bağlılık kurmaktır.

Bu blueprint 6 ana katmandan oluşur:

1. Marka ve deneyim vizyonu
2. UI sistem mimarisi
3. Motion ve premium his kuralları
4. Gameplay omurgası
5. Ekonomi ve retention sistemi
6. Uygulama sırası ve üretim planı

---

# BÖLÜM 1 — ADN MARKA VE DENEYİM VİZYONU

## 1.1 ADN ne gibi hissettirmeli

ADN’nin verdiği his şunların kesişimi olmalı:

- Güç
- Kontrol
- İlerleme
- Zenginlik
- Teknolojik üstünlük
- Erken girme avantajı
- Premium kalite

ADN bir “ucuz airdrop ekranı” gibi görünmemeli. ADN bir “yüksek değerli, oyunlaştırılmış dijital büyüme sistemi” gibi görünmeli.

## 1.2 ADN’nin karakteri

ADN’nin ürün karakteri:

- karanlık ama boğucu değil
- agresif ama itici değil
- zengin ama görgüsüz değil
- dinamik ama dağınık değil
- premium ama fazla steril değil

## 1.3 Kullanıcının ilk 10 saniyede hissetmesi gerekenler

- Bu proje düşünülmüş
- Burada sadece tıklama yok, sistem var
- Tasarım ucuz değil
- Erken girersem avantaj sağlayabilirim
- Burada vakit geçirmek mantıklı olabilir

## 1.4 ADN’nin temel vaadi

Kullanıcıya verilmesi gereken temel vaat şu mantıkta olmalı:

- her etkileşim ilerleme üretir
- ilerleme güç üretir
- güç daha hızlı kazanç üretir
- uzun vadeli oyuncu kısa vadeli oyuncudan ciddi fark yaratır
- sistem sadece şansa değil stratejiye de ödül verir

---

# BÖLÜM 2 — ULTRA PRO UI SİSTEMİ

## 2.1 Tasarımın ana prensipleri

### Prensip 1: İlk ekran dönüşüm motorudur

Hero section sadece güzel olmak için değil; güven, merak, yönlendirme ve premium his vermek için tasarlanmalıdır.

### Prensip 2: Her bölüm tek bir işi çözmelidir

- Hero = kimlik + CTA
- How it works = anlaşılabilirlik
- Reward loop = heyecan
- Utility = değer
- Trust = ikna
- FAQ = itiraz kırma

### Prensip 3: Obje hissi kurulmalıdır

Kartlar, butonlar, badge’ler ve göstergeler düz kutular gibi değil, fiziksel yüzeyler gibi görünmelidir.

### Prensip 4: Işık stratejik kullanılmalıdır

Glow sadece odak alanlarında kullanılmalı. Her objede glow olması premium hissi öldürür.

### Prensip 5: Bilgi yoğunluğu kontrollü olmalıdır

Ekran veri dolu görünebilir ama kullanıcıya karmaşık hissettirmemelidir.

---

## 2.2 Renk sistemi

### Ana renk omurgası

- Primary Background: `#07111F`
- Secondary Background: `#0B1220`
- Deep Surface: `rgba(255,255,255,0.06)`
- Surface Glass: `rgba(255,255,255,0.08)`
- Surface Elevated: `rgba(255,255,255,0.12)`
- Soft Border: `rgba(255,255,255,0.14)`
- Active Border: `rgba(56,189,248,0.38)`
- Primary Accent: `#38BDF8`
- Secondary Accent: `#60A5FA`
- Premium Accent: `#D6B25E`
- Success: `#34D399`
- Warning/Event: `#FB7185`
- Text Primary: `#F3F7FB`
- Text Secondary: `#A6B4C3`
- Text Muted: `#6E8097`

### Renk kullanım kuralları

- Arka plan lacivert-antrasit ekseninde kalmalı
- Ana odak rengi cyan/blue ailesi olmalı
- Altın yalnızca premium vurgu, rozet, seviye veya yüksek statü alanında kullanılmalı
- Kırmızı sadece urgency ve özel event aksanı olarak kontrollü kullanılmalı
- Saf siyah kullanılmamalı
- Çiğ neon etkisi yaratılmamalı

### Renk katman kullanımı

1. Base: koyu zemin
2. Surface: cam yüzeyler
3. Accent: odak ve aksiyon alanları
4. Premium accent: nadir ve statü odaklı alanlar
5. Functional colors: success/warning/info

---

## 2.3 Typography sistemi

### Font rol ayrımı

- Display font: başlıklar, hero, section title, high-value callouts
- Interface sans: body, kart metinleri, buton yazıları, stat değerleri

### Başlık dili

Başlıklar uzun cümle olmamalı. Yumruk gibi kısa ve ritmik olmalı.

Örnek iyi başlıklar:

- Build Faster. Earn Smarter.
- Start Small. Scale Hard.
- Tap. Upgrade. Dominate.
- Momentum Becomes Power.
- Your Rise Starts Here.

### Boyut sistemi

- H1: 56–72 desktop / 40–46 mobile
- H2: 40–52 desktop / 30–36 mobile
- H3: 24–30
- H4: 18–22
- Body large: 18
- Body standard: 16
- Label: 12–14

### Yazı kullanım kuralları

- Tek paragraf en fazla 2–3 kısa satır
- Hero alt metni tek blokta maksimum 2 cümle
- Kart içi metinler taranabilir olmalı
- Çok teknik token dili kullanma
- “infrastructure, decentralized protocol, revolutionary” gibi generic kripto kelimelerini azalt

---

## 2.4 Grid, spacing ve layout sistemi

### Grid

- Desktop: 12 kolon
- Tablet: 6 kolon
- Mobile: 4 kolon

### Gutter ve spacing

- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96
- Section spacing desktop: 96–128
- Section spacing mobile: 56–80

### Radius sistemi

- pill: 999px
- chip: 14–18px
- normal card: 24px
- premium hero shell: 28–32px
- modal/drawer: 24px

### Yüzey mantığı

- her section aynı zemin hissine sahip olmamalı
- zemin derinliği ve yüzey yoğunluğu section bazında hafifçe değişmeli
- background katmanları: gradient + blur orb + noise + subtle grid

---

# BÖLÜM 3 — ADN LANDING VE APP UI MİMARİSİ

## 3.1 Hero section

### Amacı

İlk 5 saniyede kullanıcıyı durdurmak ve yönlendirmek.

### Hero içeriği

- small badge
- large statement headline
- supporting copy
- dual CTA row
- trust chips
- right-side signature visual
- bottom live metrics strip

### Hero copy örneği

**Badge:** Early Access Reward Engine

**Headline:** Build Faster. Earn Smarter. Rise Earlier.

**Support copy:** ADN turns every action into progress. Tap, upgrade, unlock high-value loops, and grow inside a premium digital economy designed for momentum.

**CTA Primary:** Launch App **CTA Secondary:** Explore Litepaper

### Trust chip örnekleri

- Smart Progression Engine
- Reward Driven Economy
- Secure System Design
- Early Growth Access

### Sağ görsel önerisi

- karakter merkezde
- arka planda futuristik şehir veya premium kontrol odası
- etrafta floating stat kartları
- core orb / reactor halkası
- hafif token stream görselleri
- profit / multiplier / vault çağrışımı yapan elementler

### Hero’da bulunması gereken metrikler

- Active Users
- Daily Sessions
- Reward Loops Triggered
- Upgrade Paths Unlocked

Bu metrikler gerçek sayı olmak zorunda değilse placeholder olarak tasarlanabilir, ama sonradan canlı verilere bağlanabilecek şekilde komponentleşmeli.

---

## 3.2 How It Works section

### Amaç

Kullanıcının sistemi 10 saniyede kavraması.

### Yapı

3 veya 4 kart yeterli:

1. Join
2. Earn
3. Upgrade
4. Expand

### Kart örneği

**Join the Network** Create your starting position and enter the reward loop.

**Earn Through Action** Every tap, mission, and boost turns activity into measurable progress.

**Upgrade the Engine** Unlock stronger gains, better multipliers, and higher-value systems.

**Expand Your Reach** Move from early growth into vault control, automation, and long-term dominance.

---

## 3.3 Reward Loop section

### Amaç

ADN’nin basit clicker olmadığını göstermek.

### Ana mesaj

“ADN is not just tapping. It is layered progression.”

### Gösterilecek sistemler

- base gain
- combo growth
- crit bursts
- chest rewards
- automation
- daily streak
- events

### Görsel önerisi

Node/flow diagram: Tap → Gain → Upgrade → Trigger → Unlock → Return Stronger

---

## 3.4 Utility section

### Amaç

Token ya da oyun içi değerin neden anlamlı olduğunu göstermek.

### Kart başlıkları

- Acceleration
- Access
- Premium Paths
- Future Expansion Utility

### Dil tonu

- büyük söz verme
- ne işe yaradığı net olsun
- “future utility” varsa şişirme, fazları belirt

---

## 3.5 Social proof / trust section

### Amaç

Kullanıcının kafasındaki “neden güveneyim” sorusunu çözmek.

### İçerik alanları

- quality architecture
- progression transparency
- economy balance intent
- ecosystem roadmap phases
- community growth
- feature readiness status

### Görsel format

- sayı kartları
- milestone progress bar
- phase chips
- architecture badges

---

## 3.6 Progression / Meta section

### Amaç

Uzun vadeli oyunun varlığını hissettirmek.

### Gösterilecek katmanlar

- levels
- mastery
- prestige
- vault expansion
- social rank
- seasonal evolution

---

## 3.7 FAQ section

### Amacı

Kullanıcı itirazlarını daha sormadan kırmak.

### Soru örnekleri

- How do rewards scale?
- What makes ADN different from a basic clicker?
- How does progression become more valuable over time?
- What creates long-term utility inside the system?
- How will future phases expand the experience?

---

## 3.8 Final CTA section

### Amacı

Tüm sayfanın sonunda kullanıcıyı tek bir eyleme zorlamak.

### Yapı

- kısa güçlü başlık
- tek cümle destek
- 1 primary CTA
- 1 lightweight secondary CTA

Örnek: **The Early Edge Does Not Stay Early Forever.** Enter ADN now and build momentum before the next phase unlocks.

---

# BÖLÜM 4 — ADN APP İÇİ UI SİSTEMİ

## 4.1 App shell

Uygulama açıldığında kullanıcıya güçlü ve net bir dashboard hissi verilmeli.

### App shell bileşenleri

- top bar
- profile/level chip
- balance strip
- main action zone
- quest drawer preview
- event banner
- bottom navigation

### Top bar

İçerik:

- logo / screen title
- level chip
- premium currency preview
- notifications / missions icon

### Bottom navigation

Sekmeler:

- Home
- Upgrades
- Missions
- Vault
- Social

Opsiyonel:

- Shop
- Events
- Prestige

---

## 4.2 Home screen

### Olması gerekenler

- ana karakter veya ana tap objesi
- coin/energy feedback
- combo meter
- quick stats
- chest preview
- active boost row
- daily progress glimpse

### Ana aksiyon bölgesi

Tap butonu ya da tap objesi ekranın merkezindeki kahraman olmalı. Bu obje:

- basıldığında fizik hissi vermeli
- scale, glow, number pop, particle üretmeli
- combo ile birlikte davranış değiştirebilmeli

---

## 4.3 Upgrade screen

### Yapı

- kategori filtreleri
- upgrade kartları
- owned level indicator
- next effect preview
- cost display
- affordability state

### Kategori sekmeleri

- Tap Power
- Combo & Crit
- Automation
- Utility
- Meta

---

## 4.4 Mission screen

### Kart yapısı

- görev başlığı
- hedef
- progress bar
- reward preview
- deadline/event tag
- quick claim state

### Segmentler

- Daily
- Weekly
- Mastery
- Event
- Social

---

## 4.5 Vault / economy screen

### İçerik

- passive generation summary
- chest inventory
- boosters
- shards
- premium items
- collected milestones

---

## 4.6 Social screen

### İçerik

- clan overview
- leaderboard categories
- referral progress
- shared milestones
- contribution stats

---

# BÖLÜM 5 — COMPONENT LIBRARY

## 5.1 Global tasarım komponentleri

- AppShell
- SectionContainer
- GlassCard
- PremiumCard
- GradientBackground
- GlowOrb
- NoiseLayer
- SectionLabel
- DisplayTitle
- SupportingText
- DividerGlow
- StatChip
- TrustChip
- PillBadge
- ProgressBar
- NumberTicker
- TooltipCard
- DataPill
- AccentLine

## 5.2 CTA komponentleri

- PrimaryButton
- SecondaryButton
- GhostButton
- CTAGroup
- IconButton

## 5.3 Hero komponentleri

- HeroBadge
- HeroHeadline
- HeroSubtitle
- HeroCTAStack
- HeroTrustRow
- CoreOrbVisual
- FloatingMetricCard
- LiveStatsStrip

## 5.4 Gameplay UI komponentleri

- TapCore
- GainBurstText
- ComboMeter
- CritIndicator
- OverdriveRing
- ChestCard
- RewardToast
- UpgradeTile
- MissionCard
- DailyStreakCard
- EventBanner
- LevelBadge
- PrestigePanel
- ClanContributionCard

## 5.5 Meta UI komponentleri

- RankLadder
- VaultSummaryCard
- MilestoneRoadmap
- PhaseChip
- SeasonBanner
- SocialProofCard

---

# BÖLÜM 6 — MOTION SYSTEM MASTER RULES

## 6.1 Motion dili

ADN’de animasyon oyuncak gibi değil, premium güç gibi hissettirmeli.

### Ana ilkeler

- hızlı ama panik değil
- dinamik ama kirli değil
- fiziksel ama abartılı değil
- etkileyici ama dikkat dağıtmayan

## 6.2 Süreler

- micro interaction: 160–240ms
- card hover: 220–300ms
- section reveal: 420–650ms
- modal/drawer transition: 280–360ms
- number ticker: bağlama göre 400–900ms

## 6.3 Motion tipleri

- fade + y shift
- blur cleanup reveal
- hover lift
- border light sweep
- button press compression
- scale pulse
- progress fill glide
- orbit drift
- number pop burst
- small particle release

## 6.4 Hero motion sırası

1. badge
2. headline
3. subtitle
4. CTA row
5. trust chips
6. floating cards
7. right visual
8. stats strip

## 6.5 Gameplay motion

Tap sırasında:

- ana obje hafif squash + release
- sayı pop’ları yukarı çıkar
- combo bar fill akar
- crit olursa renk ve scale farkı oluşur
- overdrive yaklaşırken çevresel ışık yoğunlaşır

---

# BÖLÜM 7 — ADN GAMEPLAY OMURGASI

## 7.1 Ana sistem felsefesi

ADN, basit bir tıklama döngüsü değil; katmanlı büyüme sistemidir.

Sistem 4 loop üzerine kurulmalıdır:

1. Core loop
2. Session loop
3. Daily loop
4. Long-term meta loop

---

## 7.2 Core loop

### Ana akış

Tap → Gain → Upgrade → Trigger → Unlock → Return Stronger

### Tap’in amacı

Tap yalnızca sayı arttırmak için değil, sistem içi tetikleyici olarak çalışmalıdır.

### Tap değişkenleri

- Base Tap Value
- Combo Multiplier
- Crit Chance
- Crit Power
- Event Modifier
- Temporary Buff Modifier
- Proc Chance
- Energy Modifier
- Passive Assist Bonus

### Hedef duygu

Oyuncu her tap’te yalnızca gelir değil, potansiyel hissetmeli.

---

## 7.3 Session loop

### 2–5 dakikalık oturum hedefleri

Bir kısa oturumda oyuncunun şunlardan en az biri yaşanmalı:

- 1 upgrade almak
- combo threshold geçmek
- 1 görev tamamlamak
- 1 chest açmak
- 1 boost tetiklemek
- 1 yeni mini milestone almak

### Neden önemli

Kısa oturumlarda tatmin duygusu oluşmazsa kullanıcı geri dönmez.

---

## 7.4 Daily loop

### Her gün geri çağıran mekanikler

- daily login reward
- streak reward
- rotating daily missions
- daily chest
- event window
- leaderboard refresh
- limited day multiplier

### Streak kurtarma sistemi

- one-time shield
- recovery quest
- weekly restore token

### Hedef duygu

“Bugün girmezsem küçük ama anlamlı bir şeyi kaçırırım.”

---

## 7.5 Long-term meta loop

### Katmanlar

- levels
- mastery tree
- prestige/rebirth
- rarity progression
- automation depth
- social status
- seasonal growth
- zone expansion

### Hedef duygu

“Ben sadece daha fazla tıklamıyorum; artık daha büyük bir oyuncuyum.”

---

# BÖLÜM 8 — COMBO, CRIT VE MOMENTUM TASARIMI

## 8.1 Combo sistemi

### Mantık

- düzenli hızlı etkileşim combo üretir
- eşik geçildikçe multiplier artar
- kaçırılan ritim combo düşürür
- upgrade’ler combo penceresini affedici hale getirir

### Örnek threshold yapısı

- x5 = minor gain boost
- x10 = speed bonus
- x20 = burst gain
- x35 = fever ready
- x50 = overdrive

### Gelişmiş modlar

- Fever Mode
- Perfect Zone
- Chain Burst
- Overdrive State
- Momentum Lock

## 8.2 Crit sistemi

### Crit’in görevi

Oyuncuya sürpriz güç anları sunmak.

### Crit çeşitleri

- Normal Crit
- Heavy Crit
- Echo Crit
- Jackpot Crit
- Chain Crit

### Görsel/işitsel fark

Crit sadece sayısal değil, görsel olarak da farklı hissettirmeli.

## 8.3 Proc sistemi

### Proc örnekleri

- Echo tap
- Lucky shard
- Chest fragment
- Frenzy spark
- Energy wave
- Double payout burst
- Reactor pulse

### Denge

Sık değil, anlamlı olacak kadar seyrek ve tatmin edici.

---

# BÖLÜM 9 — UPGRADE VE PROGRESSION AĞACI

## 9.1 Upgrade sınıfları

1. Tap Power
2. Combo & Crit
3. Automation
4. Utility
5. Meta / Prestige

## 9.2 Tap Power örnekleri

- Reinforced Tap
- Power Pulse
- Chain Impact
- Energy Strike
- Heavy Touch
- Multi-Tap Echo

## 9.3 Combo & Crit örnekleri

- Combo Retention
- Crit Calibration
- Burst Window
- Fever Trigger
- Overdrive Gain
- Perfect Zone Leniency

## 9.4 Automation örnekleri

- Drone Miner
- Passive Network
- Reward Reactor
- Vault Generator
- Background Extractor
- Timed Collector

## 9.5 Utility örnekleri

- Mission Reroll
- Streak Shield
- Event Amplifier
- Chest Booster
- Reward Scanner
- Bonus Slot Unlock

## 9.6 Meta örnekleri

- Prestige Efficiency
- Permanent Gain Boost
- Reduced Downtime
- New Zone Unlock
- Higher Rarity Access
- Advanced Mission Tier

## 9.7 Upgrade satın alma hissi

Her upgrade satın alımı:

- maliyetli hissedilmeli
- ama karşılığını net vermeli
- sadece rakam değil, davranış değişikliği oluşturmalı

---

# BÖLÜM 10 — MISSIONS, CHESTS VE REWARD ENGINE

## 10.1 Mission sistemi

### Katmanlar

- Onboarding
- Daily
- Weekly
- Mastery
- Event
- Social

### Mission örnekleri

- Reach combo x20 in 30 seconds
- Trigger fever mode twice
- Buy from 3 upgrade categories
- Open 1 rare chest
- Contribute 500 to your clan vault
- Complete all daily missions

### İyi görev kuralı

Görev oyuncuyu farklı sistemleri denemeye zorlamalı.

## 10.2 Chest sistemi

### Türler

- Common Chest
- Rare Chest
- Epic Chest
- Event Vault
- Clan Cache
- Timed Reactor Chest

### Ödül tipleri

- soft currency
- rare shards
- boost cards
- chest keys
- crit boosters
- passive multipliers
- cosmetic unlocks
- jackpot fragments

### Tasarım kuralı

Chest açmak mini an gibi hissettirmeli. Kuru liste gibi değil.

## 10.3 Reward engine

Ödüller 3 tempoda çalışmalı:

- hızlı ödül: tap, crit, combo
- orta ödül: görev, chest, daily
- uzun ödül: prestige, season, rank, mastery

---

# BÖLÜM 11 — EKONOMİ TASARIMI

## 11.1 Para türleri

1. Soft Currency
2. Rare Shards
3. Prestige Points
4. Token-Linked Utility Resource

## 11.2 Soft currency

- günlük akışın ana omurgası
- upgrade satın alır
- bol görünür ama ekonomik olarak kontrollü olur

## 11.3 Rare shards

- sınırlı dağıtılır
- özel açılımlarda kullanılır
- chest, görev, event ile gelir
- oyuncuya değerli hissettirilir

## 11.4 Prestige points

- sıfırlama sonrası kalıcı ilerleme için kullanılır
- meta gücün taşıyıcısı olur

## 11.5 Token-linked kaynak

- dikkatli tasarlanmalı
- erken aşamada sınırsız dağıtım yapılmamalı
- utility katmanına bağlanmalı
- boş spekülasyon değil fonksiyon göstermeli

## 11.6 Ekonomi riskleri

- ödül enflasyonu
- çok fazla kaynak tipi
- anlamsız fiyat duvarları
- çok erken güç patlaması
- geç oyunda anlamsız bekleme

---

# BÖLÜM 12 — PRESTIGE, ZONELAR VE META İLERLEME

## 12.1 Prestige neden gerekli

Oyuncu yalnızca büyüyen sayılarla bir süre sonra duvara toslayacaktır. Prestige, oyunu sıfırlama değil, daha üst düzleme geçirme sistemi olmalıdır.

## 12.2 Prestige ödülleri

- permanent multipliers
- new progression branches
- new rarity tiers
- new zone unlocks
- passive economy boosts
- prestige-exclusive missions

## 12.3 Faz sistemi önerisi

- Street Start
- Hustle Build
- Network Surge
- Vault Control
- Empire Expansion

## 12.4 Zone mantığı

Her zone yalnızca arka plan değişimi değil, davranış değişimi getirmeli. Örnek:

- yeni görev tipi
- yeni chest tipi
- yeni automation katmanı
- yeni görsel tema
- yeni sosyal eşik

---

# BÖLÜM 13 — EVENT, SOCIAL VE RETENTION

## 13.1 Event sistemi

### Event türleri

- weekend boost
- combo challenge
- clan race
- chest rush
- timed vault unlock
- season launch
- limited reward window

### Event hedefi

Kullanıcıya baskı yapmak değil, canlı ritim oluşturmak.

## 13.2 Sosyal sistem

### Katmanlar

- clan
- referral
- shared goals
- group vault
- ranked brackets
- contribution milestones

### Sosyal rekabet kategorileri

- daily earn
- highest combo
- fastest rise
- clan contribution
- event score
- mastery rank

## 13.3 Retention takvimi

### İlk gün

- onboarding reward
- hızlı upgrade
- ilk chest
- ilk combo peak

### İlk 3 gün

- streak kurma
- görev alışkanlığı
- kategori farkındalığı

### İlk 7 gün

- event ile tekrar çağırma
- social görünürlük
- automation tanıtımı
- mastery / prestige işaretleri

### İlk 30 gün

- clan entegrasyonu
- seasonal içerik
- prestige kararı
- kimlik ve statü hissi

---

# BÖLÜM 14 — ADN OYUN KİMLİĞİ VE HİKAYE

## 14.1 Ana hikaye

Oyuncu küçük başlar. Küçük kazançlarla sistem kurar. Zamanla kendi dijital gelir ağını büyütür, vault kontrol eder, sosyal etki alanını genişletir ve sonunda kendi dijital imparatorluğunu inşa eder.

## 14.2 Kimlik neden önemli

Sadece sayı büyümesi retention üretmez. Hikayeli ilerleme üretir.

## 14.3 Tema cümlesi

From zero momentum to digital empire.

## 14.4 İçerik tonu

- fazla çizgi roman değil
- fazla ciddi finans paneli de değil
- “oyunlaştırılmış güç ekonomisi” tonu olmalı

---

# BÖLÜM 15 — MOBILE-FIRST PREMIUM UYGULAMA KURALLARI

## 15.1 Mobil öncelik

Bu ürün mobilde başarısızsa genel başarı da zayıflar.

## 15.2 Mobil kurallar

- hero başlık 2–3 satır içinde kalmalı
- CTA başparmak alanında olmalı
- tap objesi ana odakta kalmalı
- görevler tek bakışta taranmalı
- alt navigasyon büyük ve net olmalı
- yoğun glow metni bozmamalı

## 15.3 Mobilde premium his nasıl korunur

- daha sade arka plan
- daha kısa kopya
- daha güçlü boşluk yönetimi
- daha net butonlar
- daha az ama daha etkili animasyon

---

# BÖLÜM 16 — TEKNİK ÜRETİM PRENSİPLERİ

## 16.1 Frontend mimarisi

Önerilen stack:

- React
- TypeScript
- TailwindCSS
- Framer Motion
- Zustand veya benzeri state layer

## 16.2 State katmanları

- player stats
- currencies
- upgrades
- combo state
- chest state
- mission state
- event state
- progression state

## 16.3 Design token sistemi

Tanımlanmalı:

- colors
- spacing
- radius
- shadows
- blur levels
- motion durations
- text scales

## 16.4 Component-first yaklaşım

Önce component sistemi, sonra sayfalar. Aksi halde büyüdükçe tutarsızlaşır.

---

# BÖLÜM 17 — UYGULAMA SIRASI / ROADMAP

## Faz 1 — UI foundation

- design tokens
- app shell
- hero redesign
- premium card system
- CTA system
- motion base
- mobile polish

## Faz 2 — Core gameplay

- tap engine
- combo engine
- crit engine
- gain feedback
- upgrade categories

## Faz 3 — Reward systems

- mission engine
- chest engine
- daily streak
- reward toasts
- event banners

## Faz 4 — Meta systems

- automation
- prestige
- zones
- social ranking
- season structure

## Faz 5 — Economy balancing

- cost curves
- reward pacing
- rarity tuning
- retention tuning
- session pacing

---

# BÖLÜM 18 — EN KRİTİK HATALAR VE KAÇINILACAK ŞEYLER

## Tasarım hataları

- her yere glow basmak
- saf siyah zemin
- generic crypto gradient spam
- uzun ve sıkıcı hero metni
- premium olmayan butonlar
- tüm kartların aynı görünmesi

## Oyun tasarımı hataları

- click = sadece +1
- görev tekrarları
- anlamsız upgrade enflasyonu
- chest’in sadece coin vermesi
- çok erken grind duvarı
- gereksiz çok currency
- utility’siz token söylemi
- sosyal sistemin geç gelmesi

## Ürün hataları

- onboarding yokluğu
- ne yapılacağının belirsizliği
- mobilde zayıf deneyim
- kısa oturumda tatmin eksikliği
- uzun vadede statü eksikliği

---

# BÖLÜM 19 — SONUÇ

ADN’nin ihtiyacı sadece yeni bir görünüm değildir. ADN’nin ihtiyacı; güçlü bir görsel dil, premium motion sistemi, kısa oturumda tatmin sağlayan çekirdek döngü, orta vadede alışkanlık kuran retention sistemi ve uzun vadede statü ile sosyal bağlılık üreten bir meta yapıdır.

Doğru uygulandığında ADN şu dönüşümü yaşayabilir:

- generic token landing → premium ürün kimliği
- basit tap deneyimi → katmanlı büyüme oyunu
- kısa merak → geri dönüş alışkanlığı
- dağınık fikirler → ölçeklenebilir sistem
- görünüşte proje → hissedilen marka

Bu blueprint’in amacı sadece öneri vermek değil; ADN’nin gerçekten ayırt edilebilir, güçlü ve sürdürülebilir bir ürün haline gelmesi için net tasarım ve sistem omurgası kurmaktır.

---

# BÖLÜM 20 — APP.TSX EKRAN PLANI

## 20.1 Landing App.tsx ekran akışı

Landing sayfası App.tsx içinde aşağıdaki sırayla kurgulanmalıdır:

1. GlobalBackground
2. Header
3. HeroSection
4. LiveStatsStrip
5. HowItWorksSection
6. RewardLoopSection
7. UtilitySection
8. TrustSection
9. ProgressionSection
10. FAQSection
11. FinalCTASection
12. Footer

## 20.2 App.tsx ana iskelet mantığı

App.tsx sadece tek parça büyük dosya gibi değil, section bazlı bileşenleri birleştiren orchestration katmanı gibi düşünülmelidir.

Önerilen düzen:

- AppShell
- BackgroundLayers
- Header
- Main
- Sections
- OverlayElements
- Footer

## 20.3 Landing section görev dağılımı

### Header

- logo
- nav links
- Launch App butonu
- Litepaper linki
- mobil menü

### HeroSection

- badge
- headline
- support copy
- CTA group
- trust chips
- signature visual

### LiveStatsStrip

- Active Users
- Daily Sessions
- Reward Loops Triggered
- Upgrade Paths Unlocked

### HowItWorksSection

- Join
- Earn
- Upgrade
- Expand

### RewardLoopSection

- Tap
- Combo
- Crit
- Chest
- Automation
- Streak

### UtilitySection

- Access
- Acceleration
- Premium Paths
- Expansion Utility

### TrustSection

- architecture highlights
- roadmap phases
- progression transparency
- feature readiness

### ProgressionSection

- levels
- mastery
- prestige
- zones
- vault
- social rank

### FAQSection

- 5–6 kaliteli soru-cevap

### FinalCTASection

- urgency line
- 1 primary CTA
- 1 secondary CTA

## 20.4 In-app App.tsx ekran planı

Mini app / oyun ana ekranı için App.tsx akışı şöyle olmalıdır:

1. AppShell
2. TopBar
3. EventBanner
4. BalanceStrip
5. MainTapZone
6. ComboAndBoostRow
7. QuickStatsGrid
8. ChestPreview
9. DailyMissionPreview
10. BottomNav
11. OptionalDrawers

## 20.5 In-app ana ekran modülleri

### TopBar

- profile avatar/chip
- level
- premium currency
- settings / notifications

### EventBanner

- limited event title
- timer
- CTA

### BalanceStrip

- main currency
- shards
- passive income rate
- temporary boost state

### MainTapZone

- ana karakter veya ana tap core
- gain burst text
- crit indicator
- overdrive ring
- tap response layer

### ComboAndBoostRow

- combo meter
- active buffs
- fever state

### QuickStatsGrid

- tap power
- passive gain
- crit chance
- next unlock

### ChestPreview

- available chest
- progress to next chest
- quick open action

### DailyMissionPreview

- 2 veya 3 görev snapshot
- progress
- claim butonu

### BottomNav

- Home
- Upgrades
- Missions
- Vault
- Social

## 20.6 Upgrade sayfası planı

- top summary bar
- category tabs
- upgrade list/grid
- selected upgrade detail
- purchase CTA
- affordability state

## 20.7 Missions sayfası planı

- segmented tabs
- mission cards
- progress overview
- claim area
- streak summary

## 20.8 Vault sayfası planı

- passive economy summary
- chest inventory
- rare shard vault
- boost inventory
- milestone rewards

## 20.9 Social sayfası planı

- clan summary
- leaderboard tabs
- referral block
- contribution history
- shared goals

---

# BÖLÜM 21 — SECTION METİNLERİ

## 21.1 Hero metinleri

### Varyasyon 1

**Badge:** Early Access Reward Engine

**Headline:** Build Faster. Earn Smarter. Rise Earlier.

**Support copy:** ADN turns every action into momentum. Tap, upgrade, unlock high-value loops, and build your position inside a premium digital economy.

**CTA Primary:** Launch App **CTA Secondary:** Explore Litepaper

### Varyasyon 2

**Badge:** Premium Growth System

**Headline:** Tap. Scale. Dominate.

**Support copy:** Start small, grow fast, and unlock layered progression designed to reward momentum, strategy, and consistent play.

**CTA Primary:** Enter ADN **CTA Secondary:** View System

### Varyasyon 3

**Badge:** Live Reward Progression

**Headline:** From Zero Momentum to Digital Empire.

**Support copy:** ADN is built for users who move early. Every tap, mission, and upgrade feeds a system where momentum becomes long-term power.

**CTA Primary:** Start Now **CTA Secondary:** Read More

## 21.2 How It Works metinleri

### Kart 1

**Join the Network** Create your starting position and enter the ADN reward engine.

### Kart 2

**Earn Through Action** Every tap, mission, and timed event produces measurable progress.

### Kart 3

**Upgrade the Engine** Turn activity into stronger multipliers, better loops, and faster growth.

### Kart 4

**Expand Your Reach** Move from early gains into automation, vault control, and long-term dominance.

## 21.3 Reward Loop section metinleri

**Section label:** Layered Progression

**Title:** More Than Tapping. Built for Momentum.

**Body:** ADN combines tapping, combo growth, critical bursts, missions, chests, and automation into one evolving system that rewards smart and consistent play.

## 21.4 Utility section metinleri

**Section label:** Utility

**Title:** Designed for Use, Not Just Hype.

**Body:** ADN is structured around access, acceleration, progression, and premium reward paths that grow as the system expands.

### Utility cards

**Access Layers** Unlock new systems, categories, and progression thresholds.

**Acceleration** Boost growth speed through upgrades, events, and optimization.

**Premium Reward Paths** Move into higher-value loops through rare resources and stronger play.

**Expansion Utility** Future phases extend the system with deeper economy and social mechanics.

## 21.5 Trust section metinleri

**Section label:** Confidence

**Title:** Built to Feel Clear, Strong, and Reliable.

**Body:** ADN is presented as a structured system with visible progression, phased expansion, and a product-first experience designed to build confidence from the first screen.

## 21.6 Progression section metinleri

**Section label:** Meta Growth

**Title:** Every Session Builds the Next One.

**Body:** Short-term gains feed long-term power. Levels, mastery, prestige, vault growth, and social rank work together to turn early activity into lasting advantage.

## 21.7 Final CTA metinleri

### Varyasyon 1

**Headline:** The Early Edge Does Not Stay Early Forever.

**Body:** Enter ADN now and build momentum before the next phase unlocks.

**CTA Primary:** Launch App **CTA Secondary:** Explore Litepaper

### Varyasyon 2

**Headline:** Momentum Rewards the First Movers.

**Body:** Step into ADN, activate your first loop, and start building long-term advantage.

**CTA Primary:** Start Your Rise **CTA Secondary:** View Progression

## 21.8 FAQ metinleri

**Q:** How do rewards scale? **A:** Rewards scale through upgrades, combo thresholds, crit bursts, event bonuses, and long-term meta progression.

**Q:** What makes ADN different from a basic clicker? **A:** ADN uses layered systems like missions, chests, automation, prestige, and social growth instead of relying only on repetitive tapping.

**Q:** Why does early entry matter? **A:** Early users benefit from earlier progression, earlier system familiarity, and faster positioning before future phases expand the experience.

**Q:** What creates long-term utility inside the system? **A:** Access layers, progression depth, rare resources, premium loops, and future expansion mechanics create long-term value.

**Q:** How does ADN stay engaging over time? **A:** Daily systems, event cadence, mission variety, meta growth, and social competition work together to keep sessions fresh.

---

# BÖLÜM 22 — COMPONENT İSİMLERİ VE DOSYA MANTIĞI

## 22.1 Landing section komponentleri

- Header
- MobileMenuSheet
- HeroSection
- HeroVisual
- HeroTrustChips
- LiveStatsStrip
- HowItWorksSection
- RewardLoopSection
- UtilitySection
- TrustSection
- ProgressionSection
- FAQSection
- FinalCTASection
- Footer

## 22.2 Global UI komponentleri

- AppShell
- SectionContainer
- GradientBackground
- NoiseOverlay
- GlowOrb
- GlassCard
- PremiumCard
- SectionLabel
- DisplayHeading
- BodyCopy
- PrimaryButton
- SecondaryButton
- GhostButton
- TrustChip
- StatCard
- MetricPill
- ProgressBar
- NumberTicker
- FloatingBadge
- DividerGlow

## 22.3 In-app gameplay komponentleri

- TopBar
- EventBanner
- BalanceStrip
- MainTapZone
- TapCore
- GainBurstText
- CritFlash
- ComboMeter
- OverdriveRing
- ActiveBoostRow
- QuickStatsGrid
- ChestPreviewCard
- MissionPreviewList
- BottomNavigation

## 22.4 Upgrades komponentleri

- UpgradeCategoryTabs
- UpgradeGrid
- UpgradeTile
- UpgradeDetailPanel
- PurchaseButton
- AffordabilityHint

## 22.5 Missions komponentleri

- MissionTabs
- MissionCard
- MissionProgressBar
- RewardPreview
- ClaimButton
- StreakSummaryCard

## 22.6 Vault komponentleri

- VaultSummaryCard
- ChestInventoryGrid
- BoosterInventoryCard
- ShardBalanceCard
- MilestoneRewardPanel

## 22.7 Social komponentleri

- ClanOverviewCard
- LeaderboardTabs
- RankCard
- ReferralPanel
- SharedGoalCard
- ContributionHistoryList

## 22.8 Önerilen klasör yapısı

- components/layout
- components/landing
- components/gameplay
- components/upgrades
- components/missions
- components/vault
- components/social
- components/ui
- lib/tokens
- lib/data
- store
- hooks

---

# BÖLÜM 23 — TASARIM TOKENLARI

## 23.1 Color tokens

```ts
export const colors = {
  bgPrimary: '#07111F',
  bgSecondary: '#0B1220',
  surfaceDeep: 'rgba(255,255,255,0.06)',
  surfaceGlass: 'rgba(255,255,255,0.08)',
  surfaceElevated: 'rgba(255,255,255,0.12)',
  borderSoft: 'rgba(255,255,255,0.14)',
  borderActive: 'rgba(56,189,248,0.38)',
  accentPrimary: '#38BDF8',
  accentSecondary: '#60A5FA',
  accentPremium: '#D6B25E',
  success: '#34D399',
  warning: '#FB7185',
  textPrimary: '#F3F7FB',
  textSecondary: '#A6B4C3',
  textMuted: '#6E8097',
};
```

## 23.2 Spacing tokens

```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
  '5xl': 96,
};
```

## 23.3 Radius tokens

```ts
export const radius = {
  pill: 999,
  chip: 16,
  card: 24,
  shell: 32,
  modal: 24,
};
```

## 23.4 Shadow tokens

```ts
export const shadows = {
  soft: '0 10px 30px rgba(0,0,0,0.18)',
  card: '0 12px 36px rgba(0,0,0,0.22)',
  glow: '0 0 40px rgba(56,189,248,0.18)',
  premium: '0 0 32px rgba(214,178,94,0.14)',
};
```

## 23.5 Blur tokens

```ts
export const blur = {
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '40px',
};
```

## 23.6 Motion tokens

```ts
export const motion = {
  micro: 0.18,
  hover: 0.24,
  section: 0.55,
  drawer: 0.32,
  ticker: 0.75,
};
```

## 23.7 Type scale tokens

```ts
export const typeScale = {
  h1: 'clamp(40px, 6vw, 72px)',
  h2: 'clamp(30px, 4.8vw, 52px)',
  h3: 'clamp(24px, 3vw, 30px)',
  h4: 'clamp(18px, 2.2vw, 22px)',
  bodyLg: '18px',
  body: '16px',
  label: '13px',
};
```

## 23.8 Tailwind theme karşılığı

```ts
export const adnTheme = {
  colors,
  spacing,
  radius,
  shadows,
  blur,
  motion,
  typeScale,
};
```

---

# BÖLÜM 24 — ZIP İÇİN EK DOSYA ÖNERİLERİ

Pakete eklenmesi önerilen dosyalar:

- `ADN_Ultra_Pro_Master_Blueprint.md`
- `ADN_App_TSX_Screen_Plan.md`
- `ADN_Section_Copy.md`
- `ADN_Component_Map.md`
- `ADN_Design_Tokens.ts`
- `ADN_Readme.txt`

Bu dosya yapısı, dokümanı sadece okunacak metin değil, doğrudan üretim referansı haline getirir.
