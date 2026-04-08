import { useEffect, useMemo, useState } from 'react';
import lionImage from '../assets/lion-clean.png';
import tokenImage from '../assets/adn-token-clean.png';

type SitePageKey = 'home' | 'vision' | 'gameplay' | 'economy' | 'growth' | 'control' | 'roadmap';
type Locale = 'tr' | 'en';

type DetailCard = { title: string; text: string; bullets?: string[] };
type Stat = { label: string; value: string };
type Spotlight = { title: string; text: string; bullets: string[] };
type PageData = {
  key: SitePageKey;
  label: string;
  kicker: string;
  title: string;
  intro: string;
  summary: string;
  stats: Stat[];
  cards: DetailCard[];
  spotlight?: Spotlight;
};
type CopySet = {
  brandSub: string;
  openBot: string;
  openMiniApp: string;
  backHome: string;
  popupTitle: string;
  routeEyebrow: string;
  sectionsTitle: string;
  sectionsBody: string;
  packsTitle: string;
  packsBody: string;
  otherPagesTitle: string;
  otherPagesBody: string;
  footer: string;
  heroBadges: string[];
  routeCards: Array<{ page: SitePageKey; title: string; text: string }>;
  pages: PageData[];
};

const TELEGRAM_BOT_URL = 'https://t.me/adntoken_bot';
const MINI_APP_URL = 'https://adntoken-web-t8ue.vercel.app';

const trPages: PageData[] = [
  {
    key: 'home',
    label: 'Ana Sayfa',
    kicker: 'Sunum Merkezi',
    title: 'ADN Token, sıfırdan güce uzanan premium bir Telegram ekonomi deneyimidir.',
    intro: 'ADN Token; oyun ilerlemesi, ekonomi disiplini, sosyal büyüme ve operasyonel güven katmanlarını tek bir güçlü ürün anlatımında birleştirir.',
    summary: 'Bu sunum yapısı; marka kimliğini, ürün derinliğini, token ekonomisini, büyüme motorunu ve yol haritasını ayrı sayfalarda temiz bir dille sunar.',
    stats: [
      { label: 'Konumlandırma', value: 'Zero to Empire' },
      { label: 'Dağıtım', value: 'Telegram Mini App' },
      { label: 'Odak', value: 'Utility + Retention' },
      { label: 'Toplam Arz', value: '1B ADN' }
    ],
    cards: [
      { title: 'Marka Kimliği', text: 'ADN, basit bir mining uygulaması gibi değil; sıfırdan sistem kurup ağını büyüten bir ekonomi deneyimi olarak konumlanır.' },
      { title: 'Ürün Derinliği', text: 'Tap hissi, cache drop, reboot meta, syndicate yapısı ve event FOMO ile ürün kalıcı bir ilerleme duygusu üretir.' },
      { title: 'Büyüme ve Güven', text: 'Referral, onboarding, leaderboard, ledger, anti-cheat ve admin control katmanları ADN hikayesini tamamlar.' }
    ],
    spotlight: {
      title: 'Hazır sunum yapısı',
      text: 'Ana ekran sade bir vitrin olarak yeniden kurgulandı. Her ana başlık ayrı sayfa URL altında açılır; detaylar ise popup pencerelerde gösterilir.',
      bullets: ['Temiz ve odaklı ana sayfa', 'Gerçek sayfa yapısında bölümler', 'Uzun ve karışık akışın kaldırılması', 'Müşteri sunumuna uygun premium ton']
    }
  },
  {
    key: 'vision',
    label: 'Vizyon',
    kicker: 'Marka Kimliği',
    title: 'ADN, clicker hissiyatını geride bırakıp cyber economy simulator seviyesine çıkar.',
    intro: 'Marka dili; coin kazan anlatımından çıkarak sistem kur, ağını büyüt, operasyonu ölçekle ve ekonomiyi sahiplen tonuna dönüştürüldü.',
    summary: 'Oyuncu ADN evreninde en alttan başlar, altyapısını kurar, ağını büyütür ve sonunda kendi ekonomik katmanını kontrol eden bir güce dönüşür.',
    stats: [
      { label: 'Slogan', value: 'Zero to Empire' },
      { label: 'Anlatı', value: 'Power, data, control' },
      { label: 'Ton', value: 'Keskin ve premium' },
      { label: 'Yolculuk', value: 'Street to control' }
    ],
    cards: [
      { title: 'Yeni oyuncu hissi', text: 'Oyuncu artık sadece ödül toplayan biri değil; operasyon kuran, ölçeği büyüten ve kontrolü ele alan bir kurucu gibi hisseder.' },
      { title: 'Evren anlatısı', text: 'ADN; para değil, enerji, veri, güç ve kontrol birimidir. Oyuncu bu gücü toplar, yönetir ve genişletir.' },
      { title: 'Yeni terminoloji', text: 'Clan yerine Syndicate, chest yerine Cache Drop, prestige yerine Reboot gibi isimler ürüne daha premium bir karakter kazandırır.' }
    ],
    spotlight: {
      title: 'Marka dili',
      text: 'Vizyon sayfası ADN markasının neden farklı olduğunu sade ve güçlü bir dille açıklar.',
      bullets: ['Kazanç değil ölçek anlatısı', 'Reset değil reboot anlamı', 'Topluluk değil network etkisi', 'Premium ürün terminolojisi']
    }
  },
  {
    key: 'gameplay',
    label: 'Gameplay',
    kicker: 'Ürün Derinliği',
    title: 'Tap döngüsü, zamanla derinleşen bir ilerleme ve ustalık yapısına dönüşür.',
    intro: 'ADN oyun omurgası; tap hissi, ödül sürprizi, reboot meta, syndicate rekabeti ve canlı etkinlikler ile daha güçlü bir retention katmanı üretir.',
    summary: 'Ürün ilk temas anında anlaşılır, ilerleyen oturumlarda ise daha stratejik ve daha sosyal bir yapıya açılır.',
    stats: [
      { label: 'Ana Döngü', value: 'Tap to Reboot' },
      { label: 'Meta', value: 'Skill + Reboot' },
      { label: 'Sosyal', value: 'Syndicate rekabeti' },
      { label: 'Canlı Katman', value: 'Event FOMO' }
    ],
    cards: [
      { title: 'Tap hissi', text: 'Animasyon, ses, haptic ve reward burst katmanı ile her etkileşim daha ağırlıklı ve tatmin edici hissedilir.' },
      { title: 'Cache Drop', text: 'Nadir ödül paketleri, sürpriz etkisi ve jackpot duygusu ile tek düze ilerlemeyi kırar.' },
      { title: 'Reboot sistemi', text: 'Reboot, sıfırlama değil; daha güçlü geri dönüş ve uzun vadeli mastery motivasyonu sunar.' },
      { title: 'Syndicate rekabeti', text: 'Topluluk ve sıralama katmanı, bireysel ilerlemeyi sosyal bir güce dönüştürür.' }
    ]
  },
  {
    key: 'economy',
    label: 'Ekonomi',
    kicker: 'Tokenomics',
    title: 'ADN ekonomisi, arz rakamından fazlasını anlatır: akışın disiplinini.',
    intro: 'Sağlam ekonomi yalnızca token arzından ibaret değildir; ödül girişi, sink çıkışı, utility kullanımı ve kontrollü payout mantığı birlikte tasarlanır.',
    summary: 'ADN Token ekonomisi, utility-first bir modelle ödül dağıtımını, premium yüzeyleri ve treasury davranışını dengeli hale getirir.',
    stats: [
      { label: 'Toplam Arz', value: '1,000,000,000 ADN' },
      { label: 'Kural', value: 'Reward < Sink' },
      { label: 'Premium', value: 'Stars + Utility' },
      { label: 'Payout', value: 'Kontrollü lifecycle' }
    ],
    cards: [
      { title: 'Flow discipline', text: 'Ödül olarak sisteme giren ADN, yakım, upgrade, commerce ve premium sinklerle dengeli kalır.' },
      { title: 'Bakiye ayrımı', text: 'Reward balance katmanlarının ayrık izlenmesi, ekonomiyi daha şeffaf ve daha kontrollü hale getirir.' },
      { title: 'Premium utility', text: 'Premium ürünler sadece gelir katmanı değil; utility değeri taşıyan bir commerce yüzeyi olarak tasarlanır.' },
      { title: 'Payout lifecycle', text: 'Pending, review, approval ve sent gibi aşamalar kontrollü bir ödül akışı sağlar.' }
    ]
  },
  {
    key: 'growth',
    label: 'Büyüme',
    kicker: 'Growth Engine',
    title: 'Dağıtım ve retention birlikte çalıştığında gerçek büyüme başlar.',
    intro: 'Referral, onboarding, leaderboard ve bildirim katmanları ADN kullanıcısını sadece içeri almaz; geri getirir, rekabete sokar ve bağlı tutar.',
    summary: 'ADN büyüme modeli, davet, sosyal kanıt ve tekrar dönüş mekaniklerini tek bir canlı büyüme motoruna bağlar.',
    stats: [
      { label: 'Loop', value: 'Invite to return' },
      { label: 'Driver', value: 'Referral quality' },
      { label: 'Retention', value: 'Onboarding + Nudges' },
      { label: 'Proof', value: 'Leaderboards' }
    ],
    cards: [
      { title: 'Referral engine', text: 'Kalite odaklı referral yapısı; aynı cihaz, aynı IP ve minimum gameplay doğrulamalarıyla daha sağlıklı büyüme sağlar.' },
      { title: 'Leaderboard surfaces', text: 'Global ve dönemsel sıralamalar sosyal kanıtı görünür hale getirir.' },
      { title: 'Bildirim katmanı', text: 'Enerji dolumu, günlük ödül ve canlı etkinlik sinyalleri kullanıcıyı doğru anda geri çeker.' },
      { title: 'Onboarding akışı', text: 'İlk dakikalardaki deneyim, oyuncunun ürünle bağını ve geri dönüş olasılığını belirler.' }
    ]
  },
  {
    key: 'control',
    label: 'Güven',
    kicker: 'Trust Layer',
    title: 'Güven, ADN ürününün ayrık bir eki değil; çekirdek parçasıdır.',
    intro: 'Ledger, replay koruması, anti-cheat, admin control ve kontrat uyumu ADN ürününün operasyonel olgunluğunu güçlendirir.',
    summary: 'Ekonomi hareketlerinin loglanması, fraud sinyallerinin izlenmesi ve admin yüzeylerinin güçlü olması ürünü daha güvenli ve daha yönetilebilir kılar.',
    stats: [
      { label: 'Ledger', value: 'Tüm hareketler kayıtlı' },
      { label: 'Fraud', value: 'Advanced Anti-Cheat' },
      { label: 'Admin', value: 'Control Surfaces' },
      { label: 'API', value: 'Contract Alignment' }
    ],
    cards: [
      { title: 'Transaction ledger', text: 'Tap, claim, purchase, reward ve payout gibi hareketler ekonomik izlenebilirlik için kayıt altına alınır.' },
      { title: 'Replay koruması', text: 'Tekrarlanan istekler ve idempotency katmanı ekonomik tutarlılığı korur.' },
      { title: 'Advanced anti-cheat', text: 'İmkânsız ilerleme, spam davranış ve referral abuse modelleri tespit edilerek risk azaltılır.' },
      { title: 'Admin control', text: 'Tuning, correction, fraud review ve payout review katmanları profesyonel operasyon yönetimi sağlar.' }
    ]
  },
  {
    key: 'roadmap',
    label: 'Yol Haritası',
    kicker: 'Build Plan',
    title: 'ADN, demo seviyesinden yayına ve live ops olgunluğuna net bir planla ilerler.',
    intro: 'Repo temeli, çekirdek oyun motoru, büyüme katmanı, güven sistemleri, monetization ve live ops başlıkları aşamalı bir kurgu ile planlandı.',
    summary: 'Yol haritası; ADN ürününün teknik olarak uygulanabilir, operasyonel olarak ölçeklendirilebilir ve ticari olarak geliştirilebilir olduğunu gösterir.',
    stats: [
      { label: 'Faz 0', value: 'Production Base' },
      { label: 'Faz 1', value: 'Core Gameplay' },
      { label: 'Faz 2', value: 'Growth + Retention' },
      { label: 'Faz 3-5', value: 'Control to Live Ops' }
    ],
    cards: [
      { title: 'Production temeli', text: 'Repo temizliği, deploy düzeni, error handling ve health katmanı ile sağlam bir başlangıç kurulur.' },
      { title: 'Çekirdek oyun motoru', text: 'Profile, tap engine, passive income, shop, level, missions ve daily reward katmanları olgunlaştırılır.' },
      { title: 'Büyüme yapısı', text: 'Referral, leaderboard, notifications ve onboarding ile retention tabanı güçlendirilir.' },
      { title: 'Canlı operasyon', text: 'Analytics, event system, A/B test ve worker altyapısı ile ADN canlı olgunluk seviyesine ulaşır.' }
    ]
  }
];

const enPages: PageData[] = [
  { ...trPages[0], label: 'Home', kicker: 'Presentation Hub', title: 'ADN Token is a premium Telegram-native economy experience built from zero to power.', intro: 'ADN Token combines progression, economic discipline, social growth and operational trust into one clear premium product story.', summary: 'This presentation structure showcases brand identity, product depth, token economy, growth engine and roadmap across separate pages.' },
  { ...trPages[1], label: 'Vision', kicker: 'Brand Identity', title: 'ADN moves beyond the clicker category into a cyber economy simulation.', intro: 'The language evolved from simple earning into building systems, growing networks and owning the economy.', summary: 'In the ADN universe, the player starts at the bottom, builds infrastructure and eventually controls a personal economic layer.' },
  { ...trPages[2], label: 'Gameplay', kicker: 'Product Depth', title: 'The tap loop evolves into a deeper progression and mastery structure.', intro: 'ADN uses tap feel, reward variance, reboot meta, syndicate competition and live events to create stronger retention.', summary: 'The experience is easy to enter, then opens into a more strategic and more social progression journey.' },
  { ...trPages[3], label: 'Economy', kicker: 'Tokenomics', title: 'The ADN economy is not just about supply. It is about flow discipline.', intro: 'A resilient economy is defined by reward inflow, sink outflow, utility use and controlled payout logic working together.', summary: 'The ADN economy is designed around utility-first behavior, visible reward logic and measurable treasury discipline.' },
  { ...trPages[4], label: 'Growth', kicker: 'Growth Engine', title: 'Real growth starts when distribution and retention work together.', intro: 'Referral, onboarding, leaderboard and notification layers bring users in, bring them back and keep them engaged.', summary: 'The ADN growth model connects invite loops, social proof and return mechanics into one live growth engine.' },
  { ...trPages[5], label: 'Trust', kicker: 'Trust Layer', title: 'Trust is not an extra layer in ADN. It is part of the core product.', intro: 'Ledger logic, replay protection, anti-cheat, admin control and contract alignment strengthen operational maturity.', summary: 'Visible monitoring, fraud reduction and strong control surfaces make ADN more secure and more manageable at scale.' },
  { ...trPages[6], label: 'Roadmap', kicker: 'Build Plan', title: 'ADN moves from launch readiness to live-ops maturity through a clear staged plan.', intro: 'Production foundation, core game engine, growth systems, trust architecture, monetization and live ops are structured across clear phases.', summary: 'The roadmap shows that ADN is not just a concept. It has a build order that supports launch, growth and long-term scaling.' }
];

const COPY: Record<Locale, CopySet> = {
  tr: {
    brandSub: 'Lite Paper 2026',
    openBot: 'Telegram Botunu Aç',
    openMiniApp: 'Mini Appi Aç',
    backHome: 'Ana sayfaya dön',
    popupTitle: 'Detay',
    routeEyebrow: 'Sayfayı aç',
    sectionsTitle: 'Tüm ana başlıklar ayrı sayfalarda sunuluyor.',
    sectionsBody: 'Her bölüm kendi URL yapısında açılır. Detay içerikleri popup pencerede gösterilir.',
    packsTitle: 'Tanıtım kurgusu ADN yapısının ana katmanlarını bir araya getiriyor.',
    packsBody: 'Kimlik, gameplay, ekonomi, büyüme, güven ve yol haritası içerikleri tek bir premium sunumda toplandı.',
    otherPagesTitle: 'Diğer sayfalar',
    otherPagesBody: 'Bir sonraki bölümü ayrı sayfa olarak açabilirsiniz.',
    footer: 'ADN Token; oyun, ekonomi, sosyal büyüme ve operasyonel güven katmanlarını tek bir premium ürün anlatımında birleştirir.',
    heroBadges: ['Telegram Mini App', 'Tap to Earn', 'Canlı Büyüme Motoru', 'Güven Katmanı'],
    routeCards: [
      { page: 'vision', title: 'Vizyon', text: 'Marka kimliği, evren anlatımı ve ADN konumlandırmasını inceleyin.' },
      { page: 'gameplay', title: 'Gameplay', text: 'Oyun döngüsü, retention mekanikleri ve ilerleme katmanlarını görün.' },
      { page: 'economy', title: 'Ekonomi', text: 'Tokenomics, utility-first akış ve ödül modelini inceleyin.' },
      { page: 'growth', title: 'Büyüme', text: 'Referral, onboarding, leaderboard ve geri dönüş motorunu açın.' },
      { page: 'control', title: 'Güven', text: 'Ledger, anti-cheat, admin control ve güven mimarisini görün.' },
      { page: 'roadmap', title: 'Yol Haritası', text: 'Ürünün yayına ve ölçeklenmeye giden planını inceleyin.' }
    ],
    pages: trPages
  },
  en: {
    brandSub: 'Lite Paper 2026',
    openBot: 'Open Telegram Bot',
    openMiniApp: 'Open Mini App',
    backHome: 'Back to home',
    popupTitle: 'Details',
    routeEyebrow: 'Open page',
    sectionsTitle: 'Every major topic is presented as a separate page.',
    sectionsBody: 'Each section opens under its own URL. Details are shown in polished popup windows.',
    packsTitle: 'The presentation brings together the strongest ADN layers in one premium structure.',
    packsBody: 'Identity, gameplay, economy, growth, trust and roadmap are unified into one clean client-ready presentation.',
    otherPagesTitle: 'Other pages',
    otherPagesBody: 'Open the next section as a separate page.',
    footer: 'ADN Token combines gameplay, economy, social growth and operational trust into one premium product narrative.',
    heroBadges: ['Telegram Mini App', 'Tap to Earn', 'Live Growth Engine', 'Trust Layer'],
    routeCards: [
      { page: 'vision', title: 'Vision', text: 'Explore brand identity, universe narrative and ADN positioning.' },
      { page: 'gameplay', title: 'Gameplay', text: 'See the game loop, retention mechanics and progression layers.' },
      { page: 'economy', title: 'Economy', text: 'Review tokenomics, utility-first flow and reward structure.' },
      { page: 'growth', title: 'Growth', text: 'Open the referral, onboarding, leaderboard and return engine.' },
      { page: 'control', title: 'Trust', text: 'Review ledger, anti-cheat, admin control and trust architecture.' },
      { page: 'roadmap', title: 'Roadmap', text: 'See the product path from launch readiness to live-ops maturity.' }
    ],
    pages: enPages
  }
};

function readPageFromLocation(): SitePageKey {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1] as SitePageKey | undefined;
  return last && ['home', 'vision', 'gameplay', 'economy', 'growth', 'control', 'roadmap'].includes(last) ? last : 'home';
}

function resolveBasePath(pathname: string) {
  const clean = pathname.replace(/\/(home|vision|gameplay|economy|growth|control|roadmap)$/, '');
  if (clean.startsWith('/lite-paper')) return '/lite-paper';
  if (clean.startsWith('/adntoken-lite-paper')) return '/adntoken-lite-paper';
  return clean;
}

function buildPagePath(basePath: string, page: SitePageKey) {
  return page === 'home' ? basePath : `${basePath}/${page}`;
}

function readLocale(): Locale {
  return window.localStorage.getItem('adn_litepaper_locale') === 'en' ? 'en' : 'tr';
}

function DetailGrid({ cards, onOpen, buttonText }: { cards: DetailCard[]; onOpen: (card: DetailCard) => void; buttonText: string }) {
  return (
    <div className="litepaper-grid">
      {cards.map((card) => (
        <button key={card.title} type="button" className="litepaper-card" onClick={() => onOpen(card)}>
          <strong>{card.title}</strong>
          <p>{card.text}</p>
          <span className="litepaper-card__cta">{buttonText}</span>
        </button>
      ))}
    </div>
  );
}

export default function LitePaperPage() {
  const [activePage, setActivePage] = useState<SitePageKey>(() => readPageFromLocation());
  const [selectedCard, setSelectedCard] = useState<DetailCard | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [locale, setLocale] = useState<Locale>(() => readLocale());

  const basePath = useMemo(() => resolveBasePath(window.location.pathname), []);
  const copy = COPY[locale];
  const pageData = useMemo(() => copy.pages.find((item) => item.key === activePage) ?? copy.pages[0], [activePage, copy.pages]);

  useEffect(() => {
    const syncFromUrl = () => {
      setActivePage(readPageFromLocation());
      setSelectedCard(null);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    const syncProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
    };
    syncProgress();
    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('scroll', syncProgress, { passive: true });
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('scroll', syncProgress);
    };
  }, []);

  useEffect(() => {
    document.title = pageData.title;
    document.documentElement.lang = locale === 'tr' ? 'tr' : 'en';
  }, [locale, pageData.title]);

  function handleLocale(next: Locale) {
    setLocale(next);
    window.localStorage.setItem('adn_litepaper_locale', next);
  }

  return (
    <div className="litepaper-shell">
      <div className="litepaper-progress" aria-hidden="true">
        <span style={{ width: `${scrollProgress}%` }} />
      </div>
      <div className="litepaper-glow litepaper-glow--left" />
      <div className="litepaper-glow litepaper-glow--right" />

      <header className="litepaper-topbar">
        <div className="litepaper-topbar__inner">
          <a className="litepaper-brand" href={buildPagePath(basePath, 'home')}>
            <img src={tokenImage} alt="ADN Token" />
            <span>
              <strong>ADN Token</strong>
              <small>{copy.brandSub}</small>
            </span>
          </a>

          <nav className="litepaper-nav" aria-label={locale === 'tr' ? 'Lite paper sayfaları' : 'Lite paper pages'}>
            {copy.pages.map((page) => (
              <a key={page.key} href={buildPagePath(basePath, page.key)} className={`litepaper-nav__button${activePage === page.key ? ' is-active' : ''}`}>
                <strong>{page.label}</strong>
                <span>{page.kicker}</span>
              </a>
            ))}
          </nav>

          <div className="litepaper-topbar__side">
            <div className="litepaper-locale" aria-label={locale === 'tr' ? 'Dil seçimi' : 'Language switch'}>
              <button type="button" className={`litepaper-locale__button${locale === 'tr' ? ' is-active' : ''}`} onClick={() => handleLocale('tr')}>TR</button>
              <button type="button" className={`litepaper-locale__button${locale === 'en' ? ' is-active' : ''}`} onClick={() => handleLocale('en')}>EN</button>
            </div>
            <a className="litepaper-topbar__cta" href={TELEGRAM_BOT_URL} target="_blank" rel="noreferrer">{copy.openBot}</a>
          </div>
        </div>
      </header>

      <main className="litepaper-page">
        <section className="litepaper-hero litepaper-hero--page">
          <div className="litepaper-hero__copy">
            <span className="litepaper-badge">{pageData.kicker}</span>
            <h1>{pageData.title}</h1>
            <p>{pageData.intro}</p>
            <div className="litepaper-chiprow">
              {copy.heroBadges.map((badge) => <span key={badge}>{badge}</span>)}
            </div>
            <div className="litepaper-actions">
              <a href={TELEGRAM_BOT_URL} target="_blank" rel="noreferrer" className="litepaper-button litepaper-button--primary">{copy.openBot}</a>
              <a href={MINI_APP_URL} target="_blank" rel="noreferrer" className="litepaper-button litepaper-button--secondary">{copy.openMiniApp}</a>
              {activePage !== 'home' ? <a href={buildPagePath(basePath, 'home')} className="litepaper-button litepaper-button--ghost">{copy.backHome}</a> : null}
            </div>
          </div>

          <div className="litepaper-hero__visual">
            <div className="litepaper-poster">
              <div className="litepaper-poster__header">
                <span>ADN Token</span>
                <strong>{pageData.label}</strong>
              </div>
              <img src={lionImage} alt="ADN mascot" className="litepaper-poster__mascot" />
              <div className="litepaper-stats">
                {pageData.stats.map((stat) => (
                  <div key={stat.label} className="litepaper-stat">
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {activePage === 'home' ? (
          <>
            <section className="litepaper-section">
              <div className="litepaper-section__header">
                <span className="litepaper-kicker">{pageData.kicker}</span>
                <h2>{copy.sectionsTitle}</h2>
                <p>{copy.sectionsBody}</p>
              </div>
              <div className="litepaper-route-grid">
                {copy.routeCards.map((card) => (
                  <a key={card.page} href={buildPagePath(basePath, card.page)} className="litepaper-route-card">
                    <span className="litepaper-route-card__eyebrow">{copy.routeEyebrow}</span>
                    <strong>{card.title}</strong>
                    <p>{card.text}</p>
                  </a>
                ))}
              </div>
            </section>

            <section className="litepaper-section">
              <div className="litepaper-section__header">
                <span className="litepaper-kicker">{pageData.kicker}</span>
                <h2>{copy.packsTitle}</h2>
                <p>{copy.packsBody}</p>
              </div>
              <DetailGrid cards={pageData.cards} onOpen={setSelectedCard} buttonText={copy.popupTitle} />
            </section>
          </>
        ) : (
          <>
            <section className="litepaper-section">
              <div className="litepaper-section__header">
                <span className="litepaper-kicker">{pageData.kicker}</span>
                <h2>{pageData.label}</h2>
                <p>{pageData.summary}</p>
              </div>
              <DetailGrid cards={pageData.cards} onOpen={setSelectedCard} buttonText={copy.popupTitle} />
            </section>

            {pageData.spotlight ? (
              <section className="litepaper-section litepaper-section--cta">
                <div className="litepaper-callout">
                  <div>
                    <span className="litepaper-kicker">{pageData.kicker}</span>
                    <h3>{pageData.spotlight.title}</h3>
                    <p>{pageData.spotlight.text}</p>
                  </div>
                  <ul className="litepaper-modal__list">
                    {pageData.spotlight.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                </div>
              </section>
            ) : null}

            <section className="litepaper-section">
              <div className="litepaper-section__header">
                <span className="litepaper-kicker">{copy.routeEyebrow}</span>
                <h2>{copy.otherPagesTitle}</h2>
                <p>{copy.otherPagesBody}</p>
              </div>
              <div className="litepaper-route-grid">
                {copy.pages.filter((item) => item.key !== activePage).map((page) => (
                  <a key={page.key} href={buildPagePath(basePath, page.key)} className="litepaper-route-card">
                    <span className="litepaper-route-card__eyebrow">{copy.routeEyebrow}</span>
                    <strong>{page.label}</strong>
                    <p>{page.intro}</p>
                  </a>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="litepaper-footer">
        <div className="litepaper-footer__card">
          <div className="litepaper-footer__brand">
            <img src={tokenImage} alt="ADN Token emblem" />
            <div>
              <strong>ADN Token</strong>
              <span>{copy.brandSub}</span>
            </div>
          </div>
          <p>{copy.footer}</p>
        </div>
      </footer>

      <div className={`litepaper-modal${selectedCard ? ' is-visible' : ''}`} role="dialog" aria-modal="true" aria-hidden={!selectedCard}>
        <div className="litepaper-modal__backdrop" onClick={() => setSelectedCard(null)} />
        <div className="litepaper-modal__card">
          <button type="button" className="litepaper-modal__close" onClick={() => setSelectedCard(null)} aria-label={locale === 'tr' ? 'Kapat' : 'Close'}>&times;</button>
          {selectedCard ? (
            <>
              <span className="litepaper-kicker">{copy.popupTitle}</span>
              <h3>{selectedCard.title}</h3>
              <p>{selectedCard.text}</p>
              {selectedCard.bullets?.length ? <ul className="litepaper-modal__list">{selectedCard.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
