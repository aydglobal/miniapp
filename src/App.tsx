import { useState } from "react";
import {
  BadgeDollarSign,
  Blocks,
  Compass,
  Gem,
  Gift,
  Globe,
  Landmark,
  Orbit,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import "./App.css";
import adnTokenLogo from "../media/adn_token.png.png";

type Lang = "tr" | "en";
type TokenKey = "community" | "ecosystem" | "liquidity" | "treasury" | "team" | "partners";
type SectionId =
  | "overview"
  | "economic-model"
  | "problem"
  | "solution"
  | "tap-to-earn"
  | "use-cases"
  | "tokenomics"
  | "architecture"
  | "security"
  | "roadmap"
  | "governance"
  | "airdrop";

const tokenomics = [
  { key: "community" as TokenKey, value: 60, color: "#2563eb" },
  { key: "ecosystem" as TokenKey, value: 15, color: "#0f766e" },
  { key: "liquidity" as TokenKey, value: 10, color: "#16a34a" },
  { key: "treasury" as TokenKey, value: 8, color: "#f59e0b" },
  { key: "team" as TokenKey, value: 4, color: "#7c3aed" },
  { key: "partners" as TokenKey, value: 3, color: "#dc2626" },
];

const tokenomicsGradient = `conic-gradient(
  #2563eb 0% 60%,
  #0f766e 60% 75%,
  #16a34a 75% 85%,
  #f59e0b 85% 93%,
  #7c3aed 93% 97%,
  #dc2626 97% 100%
)`;

const sectionIcons: Record<SectionId, typeof Sparkles> = {
  overview: Sparkles,
  "economic-model": Landmark,
  problem: Target,
  solution: Gem,
  "tap-to-earn": Zap,
  "use-cases": Globe,
  tokenomics: BadgeDollarSign,
  architecture: Blocks,
  security: ShieldCheck,
  roadmap: Rocket,
  governance: Compass,
  airdrop: Gift,
};

const content = {
  tr: {
    brandTitle: "ADN Token Dokümanları",
    brandSubtitle: "Resmi lite paper ve ürün tanıtımı",
    topLinks: [
      { href: "#economic-model", label: "Ekonomik Model" },
      { href: "#tokenomics", label: "Tokenomics" },
      { href: "#airdrop", label: "Airdrop" },
    ],
    langLabel: "Dil",
    nav: [
      { id: "overview", label: "Genel Bakış" },
      { id: "economic-model", label: "Ekonomik Model" },
      { id: "problem", label: "Problem" },
      { id: "solution", label: "Çözüm" },
      { id: "tap-to-earn", label: "Tap to Earn" },
      { id: "use-cases", label: "Kullanım Alanları" },
      { id: "tokenomics", label: "Tokenomics" },
      { id: "architecture", label: "Sistem Akışı" },
      { id: "security", label: "Güvenlik" },
      { id: "roadmap", label: "Yol Haritası" },
      { id: "governance", label: "Yönetişim" },
      { id: "airdrop", label: "Airdrop" },
    ],
    sidebarTitle: "ADN Token",
    sidebarText:
      "Oyun, Tap to Earn ve online alışveriş deneyimlerini tek bir güvenilir token altyapısında birleştiren yayın hazır dokümantasyon sitesi.",
    sidebarBadge: "Belge",
    sidebarStrong: "Resmi lite paper",
    sidebarNote: "Ürün vizyonu, token yapısı, güvenlik modeli ve airdrop kurgusu tek akışta sunulur.",
    overviewKicker: "Genel Bakış",
    overviewTitle: "ADN Token, Tap to Earn ve dijital ticaret arasında çalışan gerçek kullanım katmanıdır.",
    overviewText:
      "ADN; kullanıcı kazanımı, oyun içi harcama, sadakat, airdrop ve partner alışveriş deneyimlerini aynı ekonomik yapı içinde toplar. Bu doküman, referans token benchmarkları dikkate alınarak hazırlanmış yayın hazır lite paper sürümüdür.",
    quickFactsTitle: "Hızlı Bilgiler",
    quickFacts: [
      ["Kategori", "Oyun ve ticaret tokenı"],
      ["Toplam Arz", "100,000,000,000 ADN"],
      ["Ana Ürün", "Tap to Earn + mağaza ödülleri"],
      ["Ağ Yapısı", "Topluluk odaklı dijital ekonomi"],
    ],
    highlights: [
      {
        title: "Kullanım odaklı ekonomi",
        text: "ADN, yalnızca bir alım-satım varlığı olarak değil; görev, ödeme, sadakat ve ödül deneyimini birleştiren işlevsel bir dijital varlık olarak konumlanır.",
      },
      {
        title: "Topluluk öncelikli dağılım",
        text: "ADN ekosisteminde en büyük pay, kullanıcı büyümesi, Tap to Earn katılımı, görev ekonomisi ve airdrop mekanikleri için ayrılır.",
      },
      {
        title: "Ürün merkezli fayda",
        text: "Tap to Earn, oyun satın alımları ve online alışveriş sadakati aynı token fayda modelinde birleşir.",
      },
      {
        title: "Güvenilir operasyon",
        text: "Anti-bot kontrolleri, görev doğrulama ve şeffaf dağıtım mantığı ile güven veren bir lansman yapısı hedeflenir.",
      },
    ],
    economicModel: {
      kicker: "Ekonomik Model",
      title: "ADN arz ve dağılım mantığı",
      text: "ADN toplam arzı 100 milyar adet olarak yapılandırılmıştır. Bu ölçek; mikro ödül ekonomisi, oyun içi kullanım, yüksek kullanıcı erişimi ve sadakat tabanlı dağıtım yapısını dengeli biçimde desteklemek için seçilmiştir.",
      stats: [
        ["Toplam Arz", "100B ADN"],
        ["Topluluk Payı", "60%"],
        ["Likidite Payı", "10%"],
        ["Rezerv ve Hazine", "8%"],
      ],
    },
    problem: {
      kicker: "Problem",
      title: "Dijital ödül ve harcama deneyimi parçalı ilerliyor",
      text: "Kullanıcı bir uygulamada etkileşim üretirken başka bir platformda harcama yapıyor; ancak bu iki davranışı ortak değer modeliyle bağlayan ürünler hâlâ sınırlı. ADN, Tap to Earn kullanıcı tabanını ödeme ve sadakat ekonomisine bağlamak için tasarlanır.",
    },
    solution: {
      kicker: "Çözüm",
      title: "ADN tek ekonomik katman olarak çalışır",
      callout:
        "ADN; Tap to Earn uygulaması, oyun ekonomileri, merchant ödülleri ve airdrop dağıtımını tek ürün dili içinde birleştirerek kullanıcı davranışını uzun vadeli ekosistem değerine dönüştürür.",
    },
    tap: {
      kicker: "Tap to Earn Uygulaması",
      title: "Tap to Earn uygulaması büyüme motorudur",
      text: "ADN ekosisteminde Tap to Earn yalnızca trafik kaynağı değil, aynı zamanda kullanıcı kalitesi, sadakat seviyesi ve airdrop uygunluğu için ana sinyal katmanıdır.",
      items: [
        {
          title: "Günlük görev ekonomisi",
          text: "Kullanıcılar tap, check-in, görev, referans ve sezon etkinlikleriyle puan üretir ve ADN hak edişi kazanır.",
        },
        {
          title: "Sürdürülebilir denge",
          text: "Enerji, combo, görev tavanı ve seviye mantığı ile kontrolsüz enflasyon yerine dengeli büyüme hedeflenir.",
        },
        {
          title: "Airdrop'a bağlı değer akışı",
          text: "Tap to Earn davranışı, airdrop puanı ve ekosistem sadakati ile doğrudan ilişkilendirilir.",
        },
      ],
    },
    useCases: {
      kicker: "Kullanım Alanları",
      title: "Temel kullanım alanları",
      items: [
        {
          title: "Oyun içi kullanım",
          items: [
            "Skin, battle pass, turnuva ve premium erişim ödemeleri",
            "Görev, sezon, başarı ve topluluk etkinliği ödülleri",
            "VIP üyelik, boost ve özel içerik kilitleri",
          ],
        },
        {
          title: "Online alışveriş kullanımı",
          items: [
            "Partner mağazalarda cashback ve indirim mekanikleri",
            "Sepet tamamlama ve kampanya katılım teşvikleri",
            "Sadakat puanını token ekonomisine bağlayan alışveriş akışı",
          ],
        },
        {
          title: "Topluluk ve yönetişim",
          items: [
            "Stake ederek ekosistem katkı ödülleri alma",
            "Ürün öncelikleri ve kampanya yapıları için oylama",
            "Özel görev serileri ve whitelist erişimi",
          ],
        },
      ],
    },
    tokenomics: {
      kicker: "Tokenomics",
      title: "ADN dağılım modeli",
      text: "ADN dağılım modeli; kullanıcı kazanımı, ekosistem büyümesi, likidite sürdürülebilirliği ve operasyonel devamlılık arasında dengeli bir yapı kurmak amacıyla tasarlanmıştır. Topluluk, Tap to Earn ve airdrop havuzu toplamda 60% olarak belirlenmiştir.",
      center: "ADN Arzı",
      labels: {
        community: "Topluluk, Tap to Earn ve Airdrop",
        ecosystem: "Ekosistem Gelişimi",
        liquidity: "Likidite ve Piyasa Desteği",
        treasury: "Hazine ve Rezerv",
        team: "Takım ve Operasyon",
        partners: "Stratejik Partnerler",
      },
    },
    architecture: {
      kicker: "Sistem Akışı",
      title: "Sistem nasıl çalışır?",
      items: [
        "Kullanıcı Tap to Earn uygulamasına girer, görevleri tamamlar ve puan üretir.",
        "Cüzdan doğrulaması ile oyun içi ve ticaret odaklı kullanım alanlarına bağlanır.",
        "Sadakat seviyesi, görev kalitesi ve kullanım davranışı ADN hak ediş skorunu oluşturur.",
        "Uygun kullanıcılar airdrop, ödül ve partner teşvik akışlarına dahil edilir.",
      ],
    },
    security: {
      kicker: "Güvenlik",
      title: "Profesyonel, güvenilir ve ölçeklenebilir yapı",
      items: [
        "Cüzdan bağlantıları yalnızca güvenli imza akışları ve doğrulama katmanları ile yönetilir.",
        "Çoklu hesap, bot trafiği ve yapay görev üretimi davranış analizi ile filtrelenir.",
        "Airdrop uygunluğu, görev kalitesi, hesap güven skoru ve cüzdan geçmişi ile değerlendirilir.",
        "Dağıtım ve ödül süreçleri kayıt altına alınarak denetlenebilir ve raporlanabilir hale getirilir.",
      ],
    },
    roadmap: {
      kicker: "Yol Haritası",
      title: "Büyüme planı",
      items: [
        {
          phase: "Faz 1",
          title: "Lansman Hazırlığı",
          text: "Marka, lite paper, topluluk altyapısı, cüzdan deneyimi ve ilk bekleme listesi açılışı.",
        },
        {
          phase: "Faz 2",
          title: "Tap to Earn Beta",
          text: "Uygulama yayını, görev sistemi, seviye kurgusu, anti-bot filtreleri ve puan toplama altyapısı.",
        },
        {
          phase: "Faz 3",
          title: "Token ve Merchant Açılımı",
          text: "ADN kullanım alanlarının oyun ve online alışveriş partnerlerinde aktif hale gelmesi.",
        },
        {
          phase: "Faz 4",
          title: "Airdrop ve Ölçeklenme",
          text: "Snapshot, hak ediş, topluluk dağıtımı, staking ve yönetişim özelliklerinin açılması.",
        },
      ],
    },
    governance: {
      kicker: "Yönetişim",
      title: "Yönetişim ve ilkeler",
      items: [
        "Topluluk büyümesi ile ürün gelişimi arasında şeffaf bir karar mekanizması yürütülür.",
        "Rezerv, teşvik ve kampanya kullanımları periyodik raporlarla açıklanır.",
        "Partner kabul modeli, marka güvenliği, gerçek kullanım ve uyum kriterlerine göre çalışır.",
        "Uzun vadeli hedef, ADN'yi oyun ve ticaret odaklı sadakat ekonomisinin omurgası haline getirmektir.",
      ],
    },
    airdrop: {
      kicker: "Airdrop",
      title: "Yayın hazır airdrop modeli",
      callout:
        "ADN airdrop'u, geçici hype yerine gerçek kullanıcı kalitesi, uygulama içi davranış ve doğrulanmış sadakat sinyalleri üzerinden dağıtım yapacak şekilde tasarlanır.",
      items: [
        "Airdrop havuzu, 60% topluluk payı içindeki Tap to Earn ve erken kullanıcı ödül mekanizmasının ana parçası olarak çalışır.",
        "Hak ediş modeli; aktif kullanım, görev kalitesi, seviye, referans kalitesi ve cüzdan doğrulamasına göre puanlanır.",
        "Bot, spam, çoklu hesap ve manipülasyon tespit edilen hesaplar otomatik veya manuel inceleme ile kapsam dışı bırakılır.",
        "Snapshot tarihi, claim dönemi ve vesting detayları resmi yayında sabit takvim ile duyurulur.",
      ],
    },
    releaseTitle: "Not",
    releaseText:
      "Bu belge ADN Token lite paper sunumudur. Nihai hukuki çerçeve, listelenme planı ve teknik sözleşme detayları resmi lansman dokümanlarında ayrıca duyurulacaktır.",
    heroBadges: ["Tap to Earn", "Online Commerce", "Community Economy"],
  },
  en: {
    brandTitle: "ADN Token Docs",
    brandSubtitle: "Official lite paper and product overview",
    topLinks: [
      { href: "#economic-model", label: "Economic Model" },
      { href: "#tokenomics", label: "Tokenomics" },
      { href: "#airdrop", label: "Airdrop" },
    ],
    langLabel: "Language",
    nav: [
      { id: "overview", label: "Overview" },
      { id: "economic-model", label: "Economic Model" },
      { id: "problem", label: "Problem" },
      { id: "solution", label: "Solution" },
      { id: "tap-to-earn", label: "Tap to Earn" },
      { id: "use-cases", label: "Use Cases" },
      { id: "tokenomics", label: "Tokenomics" },
      { id: "architecture", label: "Architecture" },
      { id: "security", label: "Security" },
      { id: "roadmap", label: "Roadmap" },
      { id: "governance", label: "Governance" },
      { id: "airdrop", label: "Airdrop" },
    ],
    sidebarTitle: "ADN Token",
    sidebarText:
      "A publication-ready documentation site that brings gaming, Tap to Earn and online shopping experiences together under one reliable token infrastructure.",
    sidebarBadge: "Document",
    sidebarStrong: "Official lite paper",
    sidebarNote: "Product vision, token structure, security model and airdrop design are presented in one consistent flow.",
    overviewKicker: "Overview",
    overviewTitle: "ADN Token is a real utility layer connecting Tap to Earn and digital commerce.",
    overviewText:
      "ADN brings user acquisition, in-game spending, loyalty, airdrop mechanics and partner shopping experiences into a single economic model. This document is a publication-ready lite paper built with benchmark token references in mind.",
    quickFactsTitle: "Quick Facts",
    quickFacts: [
      ["Category", "Gaming and commerce token"],
      ["Total Supply", "100,000,000,000 ADN"],
      ["Core Product", "Tap to Earn + merchant rewards"],
      ["Network Model", "Community-led digital economy"],
    ],
    highlights: [
      {
        title: "Utility-driven economy",
        text: "ADN is positioned not merely as a tradable asset, but as a functional digital asset connecting missions, payments, loyalty and rewards.",
      },
      {
        title: "Community-first allocation",
        text: "The largest share of ADN is reserved for user growth, Tap to Earn participation, mission economics and airdrop mechanics.",
      },
      {
        title: "Product-centered utility",
        text: "Tap to Earn, in-game purchases and online shopping loyalty are combined into one token utility model.",
      },
      {
        title: "Reliable operations",
        text: "Anti-bot controls, task verification and transparent distribution logic support a trustworthy launch structure.",
      },
    ],
    economicModel: {
      kicker: "Economic Model",
      title: "ADN supply and allocation logic",
      text: "ADN is structured with a total supply of 100 billion tokens. This scale was chosen to support micro-reward economics, in-game usage, broad user accessibility and a loyalty-based distribution framework in a balanced way.",
      stats: [
        ["Total Supply", "100B ADN"],
        ["Community Share", "60%"],
        ["Liquidity Share", "10%"],
        ["Treasury and Reserve", "8%"],
      ],
    },
    problem: {
      kicker: "Problem",
      title: "Digital rewards and spending are still fragmented",
      text: "Users generate engagement in one product and spend value in another, yet very few systems connect those behaviors through a shared value layer. ADN is designed to connect Tap to Earn audiences with payment and loyalty economics.",
    },
    solution: {
      kicker: "Solution",
      title: "ADN works as a unified economic layer",
      callout:
        "ADN combines the Tap to Earn app, gaming economies, merchant rewards and airdrop distribution into one product language that turns user behavior into long-term ecosystem value.",
    },
    tap: {
      kicker: "Tap to Earn App",
      title: "The Tap to Earn app is the growth engine",
      text: "Inside the ADN ecosystem, Tap to Earn is not only a traffic source but also the core signal layer for user quality, loyalty level and airdrop eligibility.",
      items: [
        {
          title: "Daily task economy",
          text: "Users generate points and ADN eligibility through tapping, check-ins, missions, referrals and seasonal events.",
        },
        {
          title: "Sustainable balance",
          text: "Energy, combo, task caps and progression systems are designed to support controlled growth rather than uncontrolled inflation.",
        },
        {
          title: "Airdrop-linked value flow",
          text: "Tap to Earn behavior is directly connected to airdrop scoring and ecosystem loyalty.",
        },
      ],
    },
    useCases: {
      kicker: "Use Cases",
      title: "Core use cases",
      items: [
        {
          title: "In-game utility",
          items: [
            "Skin, battle pass, tournament and premium access payments",
            "Quest, season, achievement and community event rewards",
            "VIP memberships, boosts and premium content locks",
          ],
        },
        {
          title: "Online shopping utility",
          items: [
            "Cashback and discount mechanics in partner stores",
            "Cart completion and campaign participation incentives",
            "Shopping flows connected to token-based loyalty value",
          ],
        },
        {
          title: "Community and governance",
          items: [
            "Staking for ecosystem contribution rewards",
            "Voting on product priorities and campaign structures",
            "Special mission series and whitelist access",
          ],
        },
      ],
    },
    tokenomics: {
      kicker: "Tokenomics",
      title: "ADN allocation model",
      text: "The ADN allocation model is designed to balance user acquisition, ecosystem growth, liquidity sustainability and operational continuity. The combined pool for community, Tap to Earn and airdrop activity is set at 60%.",
      center: "ADN Supply",
      labels: {
        community: "Community, Tap to Earn and Airdrop",
        ecosystem: "Ecosystem Growth",
        liquidity: "Liquidity and Market Support",
        treasury: "Treasury and Reserve",
        team: "Team and Operations",
        partners: "Strategic Partners",
      },
    },
    architecture: {
      kicker: "Architecture",
      title: "How the system works",
      items: [
        "The user enters the Tap to Earn app, completes tasks and generates points.",
        "Wallet verification connects the user to in-game and commerce-focused utility layers.",
        "Loyalty level, task quality and activity behavior form the ADN eligibility score.",
        "Eligible users enter airdrop, reward and partner incentive flows.",
      ],
    },
    security: {
      kicker: "Security",
      title: "Professional, reliable and scalable structure",
      items: [
        "Wallet connections are handled only through secure signing flows and verification layers.",
        "Multi-account behavior, bot traffic and artificial task generation are filtered through behavior analysis.",
        "Airdrop eligibility is evaluated using task quality, account trust score and wallet history.",
        "Distribution and reward flows are logged to stay auditable and reportable.",
      ],
    },
    roadmap: {
      kicker: "Roadmap",
      title: "Growth roadmap",
      items: [
        {
          phase: "Phase 1",
          title: "Launch Preparation",
          text: "Branding, lite paper, community infrastructure, wallet experience and first waitlist activation.",
        },
        {
          phase: "Phase 2",
          title: "Tap to Earn Beta",
          text: "App release, mission system, progression design, anti-bot filters and points infrastructure.",
        },
        {
          phase: "Phase 3",
          title: "Token and Merchant Expansion",
          text: "ADN utility going live across gaming and online shopping partner environments.",
        },
        {
          phase: "Phase 4",
          title: "Airdrop and Scaling",
          text: "Snapshot, eligibility, community distribution, staking and governance features go live.",
        },
      ],
    },
    governance: {
      kicker: "Governance",
      title: "Governance and principles",
      items: [
        "A transparent decision mechanism is maintained between community growth and product development.",
        "Reserve, incentive and campaign usage are disclosed through periodic reporting.",
        "Partner onboarding operates through brand safety, real utility and compliance criteria.",
        "The long-term goal is to position ADN as the backbone of gaming and commerce loyalty economics.",
      ],
    },
    airdrop: {
      kicker: "Airdrop",
      title: "Publication-ready airdrop model",
      callout:
        "The ADN airdrop is designed to reward real user quality, in-app behavior and verified loyalty signals instead of short-term hype.",
      items: [
        "The airdrop pool operates as a core part of the 60% community allocation covering Tap to Earn and early user rewards.",
        "Eligibility is scored using active usage, task quality, level, referral quality and wallet verification.",
        "Bot, spam, multi-account and manipulation patterns are removed through automated or manual review.",
        "Snapshot date, claim period and vesting details will be announced through the official release calendar.",
      ],
    },
    releaseTitle: "Note",
    releaseText:
      "This document is the ADN Token lite paper presentation. Final legal framing, listing plans and technical contract details will be announced separately in official launch documents.",
    heroBadges: ["Tap to Earn", "Online Commerce", "Community Economy"],
  },
} as const;

function NavLink({ id, label }: { id: string; label: string }) {
  const Icon = sectionIcons[id as SectionId] ?? Orbit;
  return (
    <a className="nav-link" href={`#${id}`}>
      <span className="nav-icon">
        <Icon size={14} strokeWidth={2.2} />
      </span>
      <span>{label}</span>
    </a>
  );
}

function SectionBadge({ id, label }: { id: SectionId; label: string }) {
  const Icon = sectionIcons[id];
  return (
    <span className="section-kicker">
      <span className="section-kicker-icon">
        <Icon size={14} strokeWidth={2.2} />
      </span>
      {label}
    </span>
  );
}

export default function App() {
  const [lang, setLang] = useState<Lang>("tr");
  const t = content[lang];

  return (
    <div className="docs-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <img src={adnTokenLogo} alt="ADN Token" className="brand-logo-image" />
          </div>
          <div>
            <strong>{t.brandTitle}</strong>
            <span>{t.brandSubtitle}</span>
          </div>
        </div>

        <div className="topbar-controls">
          <div className="topbar-links">
            {t.topLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="lang-switch" aria-label={t.langLabel}>
            <button
              type="button"
              className={`lang-btn ${lang === "tr" ? "active" : ""}`}
              onClick={() => setLang("tr")}
            >
              TR
            </button>
            <button
              type="button"
              className={`lang-btn ${lang === "en" ? "active" : ""}`}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <div className="docs-layout">
        <aside className="sidebar">
          <div className="sidebar-card">
            <img src={adnTokenLogo} alt="ADN Token" className="sidebar-logo" />
            <div className="sidebar-title">{t.sidebarTitle}</div>
            <p>{t.sidebarText}</p>
          </div>

          <nav className="sidebar-nav">
            {t.nav.map((item) => (
              <NavLink key={item.id} id={item.id} label={item.label} />
            ))}
          </nav>

          <div className="sidebar-note">
            <span className="note-label">{t.sidebarBadge}</span>
            <strong>{t.sidebarStrong}</strong>
            <p>{t.sidebarNote}</p>
          </div>
        </aside>

        <main className="content">
          <section id="overview" className="hero">
            <div className="hero-copy">
              <SectionBadge id="overview" label={t.overviewKicker} />
              <div className="hero-brandline">
                <img src={adnTokenLogo} alt="ADN Token" className="hero-brand-emblem" />
                <div className="hero-brand-text">
                  <strong>ADN Token</strong>
                  <span>Lite Paper 2026</span>
                </div>
              </div>
              <h1>{t.overviewTitle}</h1>
              <p>{t.overviewText}</p>
              <div className="hero-badges">
                {t.heroBadges.map((badge) => (
                  <span key={badge} className="hero-badge">
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="hero-panel">
              <div className="hero-ambient hero-ambient-one" />
              <div className="hero-ambient hero-ambient-two" />
              <div className="hero-panel-brand">
                <img src={adnTokenLogo} alt="ADN Token" className="hero-logo" />
              </div>
              <div className="hero-token-stage">
                <div className="hero-ring hero-ring-one" />
                <div className="hero-ring hero-ring-two" />
                <div className="hero-token-core">
                  <img src={adnTokenLogo} alt="ADN Token" className="hero-token-image" />
                </div>
              </div>
              <div className="hero-panel-head">{t.quickFactsTitle}</div>
              <div className="fact-list">
                {t.quickFacts.map(([label, value]) => (
                  <div className="fact-item" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="summary-grid">
            {t.highlights.map((item) => (
              <article className="summary-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </section>

          <section id="economic-model" className="doc-section">
            <SectionBadge id="economic-model" label={t.economicModel.kicker} />
            <h2>{t.economicModel.title}</h2>
            <p>{t.economicModel.text}</p>
            <div className="chart-card">
              <div className="model-stats-grid">
                {t.economicModel.stats.map(([label, value]) => (
                  <div className="model-stat-card" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="problem" className="doc-section">
            <SectionBadge id="problem" label={t.problem.kicker} />
            <h2>{t.problem.title}</h2>
            <p>{t.problem.text}</p>
          </section>

          <section id="solution" className="doc-section">
            <SectionBadge id="solution" label={t.solution.kicker} />
            <h2>{t.solution.title}</h2>
            <div className="callout">{t.solution.callout}</div>
          </section>

          <section id="tap-to-earn" className="doc-section">
            <SectionBadge id="tap-to-earn" label={t.tap.kicker} />
            <h2>{t.tap.title}</h2>
            <p>{t.tap.text}</p>
            <div className="card-grid feature-grid">
              {t.tap.items.map((item) => (
                <article className="doc-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="use-cases" className="doc-section">
            <SectionBadge id="use-cases" label={t.useCases.kicker} />
            <h2>{t.useCases.title}</h2>
            <div className="card-grid">
              {t.useCases.items.map((useCase) => (
                <article className="doc-card" key={useCase.title}>
                  <h3>{useCase.title}</h3>
                  <ul>
                    {useCase.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section id="tokenomics" className="doc-section">
            <SectionBadge id="tokenomics" label={t.tokenomics.kicker} />
            <h2>{t.tokenomics.title}</h2>
            <p className="section-note">{t.tokenomics.text}</p>
            <div className="chart-grid">
              <div className="chart-card">
                <div className="donut-wrap">
                  <div className="donut-chart" style={{ background: tokenomicsGradient }}>
                    <div className="donut-hole">
                      <strong>100B</strong>
                      <span>{t.tokenomics.center}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tokenomics-list">
                {tokenomics.map((item) => (
                  <article className="metric-card" key={item.key}>
                    <span className="metric-label">
                      <span className="legend-dot" style={{ backgroundColor: item.color }} />
                      {t.tokenomics.labels[item.key]}
                    </span>
                    <strong>{item.value}%</strong>
                    <div className="progress-line">
                      <div
                        className="progress-line-fill"
                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="architecture" className="doc-section">
            <SectionBadge id="architecture" label={t.architecture.kicker} />
            <h2>{t.architecture.title}</h2>
            <ol className="steps">
              {t.architecture.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>

          <section id="security" className="doc-section">
            <SectionBadge id="security" label={t.security.kicker} />
            <h2>{t.security.title}</h2>
            <ul className="governance-list">
              {t.security.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section id="roadmap" className="doc-section">
            <SectionBadge id="roadmap" label={t.roadmap.kicker} />
            <h2>{t.roadmap.title}</h2>
            <div className="timeline">
              {t.roadmap.items.map((item) => (
                <article className="timeline-item" key={item.phase}>
                  <div className="timeline-phase">{item.phase}</div>
                  <div className="timeline-body">
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="governance" className="doc-section">
            <SectionBadge id="governance" label={t.governance.kicker} />
            <h2>{t.governance.title}</h2>
            <ul className="governance-list">
              {t.governance.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section id="airdrop" className="doc-section airdrop-section">
            <SectionBadge id="airdrop" label={t.airdrop.kicker} />
            <h2>{t.airdrop.title}</h2>
            <div className="callout">{t.airdrop.callout}</div>
            <ul className="governance-list">
              {t.airdrop.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="footer-note">
            <img src={adnTokenLogo} alt="ADN Token" className="footer-logo" />
            <strong>{t.releaseTitle}</strong>
            <p>{t.releaseText}</p>
          </section>
        </main>
      </div>
    </div>
  );
}
