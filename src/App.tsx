import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import {
  ShieldCheck,
  Zap,
  Trophy,
  Sparkles,
  Coins,
  Activity,
  Rocket,
  Star,
  Lock,
  Crown,
  Gift,
  Target,
  Gauge,
  Medal,
  Flame,
  Pickaxe,
  Shield,
  Gem,
  TrendingUp,
  Cpu,
} from "lucide-react";

type CharacterId = "Mira Vale" | "Kael Rune" | "Sera Nyx";
type TabId = "command" | "growth" | "market" | "missions" | "intel";

type UserState = {
  alias: string;
  character: CharacterId;
  shards: number;
  credits: number;
  energy: number;
  maxEnergy: number;
  combo: number;
  level: number;
  xp: number;
  streak: number;
  tapPower: number;
  passiveRate: number;
  critChance: number;
  reactorTier: number;
  droneTier: number;
  vaultTier: number;
  syncTier: number;
  rarityScore: number;
  chestCount: number;
  boosterMinutes: number;
};

type Character = {
  id: CharacterId;
  codename: string;
  title: string;
  role: string;
  story: string;
  passive: string;
  signature: string;
  colorA: string;
  colorB: string;
};

type Upgrade = {
  id: "reactor" | "drone" | "vault" | "sync";
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  description: string;
  baseCost: number;
  level: number;
  effectText: string;
};

type MarketItem = {
  id: "micro-boost" | "energy-pack" | "chest-key" | "xp-burst";
  name: string;
  price: number;
  tag: string;
  description: string;
};

type Mission = {
  id: "tap-chain" | "market-run" | "growth-loop";
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
};

type FloatGain = {
  id: number;
  value: number;
};

const TAP_COOLDOWN_MS = 320;
const ENERGY_REGEN_MS = 2600;
const PASSIVE_TICK_MS = 4000;
const BOOST_TICK_MS = 60000;

const characters: Character[] = [
  {
    id: "Mira Vale",
    codename: "GLINT",
    title: "The Spotlight Architect",
    role: "Momentum Builder",
    story:
      "Mira, şehrin düşen reklam kulelerinden veri kırıntıları toplayıp onları kazanç akışına dönüştüren ilk operatif. Onun dünyasında görünür olmak güçtür; her tap, kalabalığın dikkatini gelire çevirir.",
    passive: "+12% combo verimi",
    signature: "Crowd Surge",
    colorA: "#ffd36b",
    colorB: "#ff7b7b",
  },
  {
    id: "Kael Rune",
    codename: "VEIL",
    title: "The Silent Broker",
    role: "Stable Earner",
    story:
      "Kael, yeraltı borsa tünellerinde risk akışını okuyarak büyüdü. O kaosa oynamaz; gürültünün altında sessizce büyüyen güvenli bir imparatorluk kurar.",
    passive: "+18% pasif üretim",
    signature: "Dark Ledger",
    colorA: "#6be9ff",
    colorB: "#6e7dff",
  },
  {
    id: "Sera Nyx",
    codename: "PRISM",
    title: "The Future Caller",
    role: "Reward Multiplier",
    story:
      "Sera, ödül döngülerini henüz olmadan hisseder. Görev, kasa ve market akışını bir adım önden okuyarak küçük hareketleri büyük sıçramalara dönüştürür.",
    passive: "+15% görev ve kasa ödülü",
    signature: "Tomorrow Pulse",
    colorA: "#72ffbf",
    colorB: "#b35cff",
  },
];

const chartData = [
  { day: "Pzt", earn: 180, taps: 220 },
  { day: "Sal", earn: 250, taps: 290 },
  { day: "Çar", earn: 340, taps: 370 },
  { day: "Per", earn: 430, taps: 460 },
  { day: "Cum", earn: 540, taps: 560 },
  { day: "Cmt", earn: 620, taps: 650 },
  { day: "Paz", earn: 570, taps: 600 },
];

const marketCatalog: MarketItem[] = [
  {
    id: "micro-boost",
    name: "Flash Boost",
    price: 650,
    tag: "10 dk",
    description: "Kısa süreli x2 tap kazancı. Hızlı farm ve görev tamamlama için ideal.",
  },
  {
    id: "energy-pack",
    name: "Overcharge Cell",
    price: 420,
    tag: "+40 enerji",
    description: "Reaktörü anında besler. Uzun tap zinciri kurmak için enerji doldurur.",
  },
  {
    id: "chest-key",
    name: "Vault Key",
    price: 900,
    tag: "+1 kasa",
    description: "Nadir shard ve credit ihtimali taşıyan premium kasa anahtarı.",
  },
  {
    id: "xp-burst",
    name: "Mentor Patch",
    price: 780,
    tag: "+250 XP",
    description: "Seviye atlama eğrisini hızlandıran özel eğitim paketi.",
  },
];

const initialMissions: Mission[] = [
  {
    id: "tap-chain",
    title: "Pulse Chain",
    description: "30 kez art arda tap yap ve ritmini bozma.",
    progress: 12,
    target: 30,
    reward: "+180 Shard",
  },
  {
    id: "market-run",
    title: "Night Market Run",
    description: "Marketten 2 farklı güçlendirme kullan.",
    progress: 0,
    target: 2,
    reward: "+1 Vault Key",
  },
  {
    id: "growth-loop",
    title: "Engine Room",
    description: "Herhangi 3 geliştirmeyi toplam 5 seviyeye çıkar.",
    progress: 1,
    target: 5,
    reward: "+400 Credits",
  },
];

const baseUpgrades: Upgrade[] = [
  {
    id: "reactor",
    name: "Reactor Core",
    icon: Flame,
    description: "Tap başına üretilen shard miktarını yükseltir.",
    baseCost: 180,
    level: 1,
    effectText: "+Tap power",
  },
  {
    id: "drone",
    name: "Harvest Drone",
    icon: Pickaxe,
    description: "Dokunmadan da pasif gelir üreten dron filosunu güçlendirir.",
    baseCost: 240,
    level: 1,
    effectText: "+Idle income",
  },
  {
    id: "vault",
    name: "Vault Grid",
    icon: Shield,
    description: "Kasa ve günlük ödüllerin değerini artırır.",
    baseCost: 290,
    level: 1,
    effectText: "+Reward value",
  },
  {
    id: "sync",
    name: "Sync Engine",
    icon: Cpu,
    description: "Combo, kritik ve görev verimini dengeleyerek büyütür.",
    baseCost: 360,
    level: 1,
    effectText: "+Combo quality",
  },
];

function format(n: number): string {
  return new Intl.NumberFormat("tr-TR").format(Math.floor(n));
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function getXpNeed(level: number): number {
  return 400 + level * 180;
}

function getCharacter(id: CharacterId): Character {
  return characters.find((item) => item.id === id) ?? characters[0];
}

function getUpgradeCost(upgrade: Upgrade): number {
  return Math.round(upgrade.baseCost * (1 + (upgrade.level - 1) * 0.55));
}

export default function App() {
  const [tab, setTab] = useState<TabId>("command");
  const [user, setUser] = useState<UserState>({
    alias: "ArctisOne",
    character: "Mira Vale",
    shards: 2860,
    credits: 340,
    energy: 84,
    maxEnergy: 100,
    combo: 0,
    level: 4,
    xp: 160,
    streak: 5,
    tapPower: 9,
    passiveRate: 18,
    critChance: 12,
    reactorTier: 1,
    droneTier: 1,
    vaultTier: 1,
    syncTier: 1,
    rarityScore: 61,
    chestCount: 2,
    boosterMinutes: 0,
  });

  const [upgrades, setUpgrades] = useState<Upgrade[]>(baseUpgrades);
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [tapLocked, setTapLocked] = useState(false);
  const [gains, setGains] = useState<FloatGain[]>([]);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [marketPurchases, setMarketPurchases] = useState(0);

  const lastTapRef = useRef<number>(0);
  const gainIdRef = useRef<number>(1);

  const activeCharacter = useMemo(() => getCharacter(user.character), [user.character]);
  const xpNeed = useMemo(() => getXpNeed(user.level), [user.level]);
  const xpProgress = useMemo(() => (user.xp / xpNeed) * 100, [user.xp, xpNeed]);
  const energyProgress = useMemo(
    () => (user.energy / user.maxEnergy) * 100,
    [user.energy, user.maxEnergy]
  );
  const totalUpgradeLevels = useMemo(
    () => upgrades.reduce((sum, item) => sum + item.level, 0),
    [upgrades]
  );

  useEffect(() => {
    const regen = window.setInterval(() => {
      setUser((prev) => ({
        ...prev,
        energy: clamp(prev.energy + 1, 0, prev.maxEnergy),
      }));
    }, ENERGY_REGEN_MS);

    return () => window.clearInterval(regen);
  }, []);

  useEffect(() => {
    const passive = window.setInterval(() => {
      setUser((prev) => {
        const characterBonus = prev.character === "Kael Rune" ? 1.18 : 1;
        const boostBonus = prev.boosterMinutes > 0 ? 2 : 1;
        const gain = Math.round(prev.passiveRate * characterBonus * boostBonus);

        return {
          ...prev,
          shards: prev.shards + gain,
          xp: prev.xp + Math.round(gain * 0.35),
        };
      });
    }, PASSIVE_TICK_MS);

    return () => window.clearInterval(passive);
  }, []);

  useEffect(() => {
    const boostClock = window.setInterval(() => {
      setUser((prev) => ({
        ...prev,
        boosterMinutes: Math.max(0, prev.boosterMinutes - 1),
      }));
    }, BOOST_TICK_MS);

    return () => window.clearInterval(boostClock);
  }, []);

  useEffect(() => {
    if (user.xp >= xpNeed) {
      setUser((prev) => ({
        ...prev,
        level: prev.level + 1,
        xp: prev.xp - xpNeed,
        tapPower: prev.tapPower + 2,
        passiveRate: prev.passiveRate + 2,
        credits: prev.credits + 60,
        rarityScore: clamp(prev.rarityScore + 2, 0, 999),
      }));
    }
  }, [user.xp, xpNeed]);

  const spawnGain = (value: number) => {
    const item: FloatGain = { id: gainIdRef.current++, value };
    setGains((prev) => [...prev, item]);

    window.setTimeout(() => {
      setGains((prev) => prev.filter((x) => x.id !== item.id));
    }, 900);
  };

  const handleTap = () => {
    const now = Date.now();
    if (tapLocked || now - lastTapRef.current < TAP_COOLDOWN_MS) return;
    if (user.energy <= 0) return;

    lastTapRef.current = now;
    setTapLocked(true);

    const comboBonus = 1 + user.combo * 0.035;
    const crit = Math.random() * 100 < user.critChance ? 1.75 : 1;
    const boost = user.boosterMinutes > 0 ? 2 : 1;
    const characterBoost = user.character === "Mira Vale" ? 1.12 : 1;
    const gain = Math.round(user.tapPower * comboBonus * crit * boost * characterBoost);

    setUser((prev) => ({
      ...prev,
      shards: prev.shards + gain,
      energy: clamp(prev.energy - 1, 0, prev.maxEnergy),
      combo: clamp(prev.combo + 1, 0, 40),
      xp: prev.xp + Math.round(gain * 0.85),
    }));

    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === "tap-chain") {
          return { ...m, progress: clamp(m.progress + 1, 0, m.target) };
        }
        return m;
      })
    );

    spawnGain(gain);

    window.setTimeout(() => {
      setTapLocked(false);
    }, TAP_COOLDOWN_MS);
  };

  const buyUpgrade = (id: Upgrade["id"]) => {
    const upgrade = upgrades.find((item) => item.id === id);
    if (!upgrade) return;

    const cost = getUpgradeCost(upgrade);
    if (user.shards < cost) return;

    setUser((prev) => {
      const next = { ...prev, shards: prev.shards - cost };

      if (id === "reactor") {
        next.tapPower += 2;
        next.reactorTier += 1;
      }
      if (id === "drone") {
        next.passiveRate += 3;
        next.droneTier += 1;
      }
      if (id === "vault") {
        next.credits += 15;
        next.vaultTier += 1;
      }
      if (id === "sync") {
        next.critChance += 1.8;
        next.syncTier += 1;
      }

      next.rarityScore += 1;
      return next;
    });

    setUpgrades((prev) =>
      prev.map((item) => (item.id === id ? { ...item, level: item.level + 1 } : item))
    );

    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === "growth-loop") {
          return { ...m, progress: clamp(m.progress + 1, 0, m.target) };
        }
        return m;
      })
    );
  };

  const buyMarketItem = (item: MarketItem) => {
    if (user.shards < item.price) return;

    setUser((prev) => {
      const next = { ...prev, shards: prev.shards - item.price };

      if (item.id === "micro-boost") next.boosterMinutes += 10;
      if (item.id === "energy-pack") next.energy = clamp(prev.energy + 40, 0, prev.maxEnergy);
      if (item.id === "chest-key") next.chestCount += 1;
      if (item.id === "xp-burst") next.xp += 250;

      return next;
    });

    setMarketPurchases((x) => x + 1);

    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === "market-run") {
          return { ...m, progress: clamp(m.progress + 1, 0, m.target) };
        }
        return m;
      })
    );
  };

  const claimDaily = () => {
    if (dailyClaimed) return;

    const reward = 250 + user.streak * 40 + user.vaultTier * 25;

    setUser((prev) => ({
      ...prev,
      shards: prev.shards + reward,
      credits: prev.credits + 25,
      streak: prev.streak + 1,
      chestCount: prev.chestCount + 1,
    }));

    setDailyClaimed(true);
  };

  const openChest = () => {
    if (user.chestCount <= 0) return;

    const shardReward = 220 + user.vaultTier * 55 + (user.character === "Sera Nyx" ? 60 : 0);

    setUser((prev) => ({
      ...prev,
      chestCount: prev.chestCount - 1,
      shards: prev.shards + shardReward,
      credits: prev.credits + 18,
      rarityScore: prev.rarityScore + 3,
    }));

    spawnGain(shardReward);
  };

  const claimMission = (missionId: Mission["id"]) => {
    const targetMission = missions.find((m) => m.id === missionId);
    if (!targetMission || targetMission.progress < targetMission.target) return;

    setUser((prev) => {
      const next = { ...prev };

      if (missionId === "tap-chain") next.shards += 180;
      if (missionId === "market-run") next.chestCount += 1;
      if (missionId === "growth-loop") next.credits += 400;

      return next;
    });

    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId
          ? {
              ...m,
              progress: 0,
              target: m.target + (m.id === "tap-chain" ? 10 : 1),
            }
          : m
      )
    );
  };

  const featureRows: Array<[string, string]> = [
    ["Hızlı tap döngüsü", `${TAP_COOLDOWN_MS}ms`],
    ["Pasif kazanç", `${user.passiveRate}/tick`],
    ["Kritik şans", `${user.critChance.toFixed(1)}%`],
    ["Toplam upgrade", `${totalUpgradeLevels}`],
    ["Kasa anahtarı", `${user.chestCount}`],
    ["Booster", user.boosterMinutes > 0 ? `${user.boosterMinutes} dk` : "Hazır değil"],
    ["Rarity skoru", `${user.rarityScore}`],
    ["Market alımı", `${marketPurchases}`],
  ];

  return (
    <div style={shellStyle}>
      <style>{css}</style>

      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="ambient ambient-c" />

      <div className="wrap">
        <section className="hero card">
          <div>
            <div className="chip-row">
              <span className="chip success">
                <ShieldCheck size={14} />
                Protected Economy
              </span>
              <span className="chip">
                <Sparkles size={14} />
                Original City Lore
              </span>
              <span className="chip gold">
                <Crown size={14} />
                Level {user.level}
              </span>
            </div>

            <h1>SHARDLINE</h1>

            <p className="hero-copy">
              Bu evrende insanlar coin değil, görünürlük topluyor. Görünürlük shard'a,
              shard güce, güç ise şehir içindeki yerini belirleyen gerçek ekonomiye
              dönüşüyor.
            </p>

            <div className="story-box">
              <div>
                <span className="story-kicker">Dünya</span>
                <strong>Shardline City</strong>
                <p>
                  Reklam kuleleri, veri pazarları ve enerji odalarıyla yaşayan neon bir
                  metropol.
                </p>
              </div>

              <div>
                <span className="story-kicker">Amaç</span>
                <strong>İmza Bırak</strong>
                <p>
                  Tap, geliştir, marketi kullan, kasaları aç ve lig tablosunda iz bırak.
                </p>
              </div>
            </div>
          </div>

          <div className="hero-stats">
            <StatCard icon={<Gem size={18} />} label="Shards" value={format(user.shards)} sub="Ana kaynak" />
            <StatCard icon={<Coins size={18} />} label="Credits" value={format(user.credits)} sub="Premium ekonomi" />
            <StatCard icon={<Zap size={18} />} label="Energy" value={`${user.energy}/${user.maxEnergy}`} sub="Reaktör yükü" />
            <StatCard icon={<Gauge size={18} />} label="Tap Power" value={`${user.tapPower}`} sub="Anlık hasat" />
          </div>
        </section>

        <section className="layout">
          <div className="left-stack">
            <section className="card reactor-panel">
              <div className="section-head">
                <div>
                  <div className="eyebrow">Ana döngü</div>
                  <h2>Signal Reactor</h2>
                  <p>
                    {activeCharacter.codename} modunda çalışıyorsun. {activeCharacter.story}
                  </p>
                </div>

                <div className="badge-stack">
                  <span className="pill">Combo x{user.combo}</span>
                  <span className="pill">{activeCharacter.signature}</span>
                </div>
              </div>

              <div className="reactor-zone">
                <AnimatePresence>
                  {gains.map((gain, index) => (
                    <motion.div
                      key={gain.id}
                      className="float-gain"
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: -120 - index * 8, scale: 1.06 }}
                      exit={{ opacity: 0, y: -150, scale: 0.76 }}
                      transition={{ duration: 0.8 }}
                    >
                      +{gain.value}
                    </motion.div>
                  ))}
                </AnimatePresence>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleTap}
                  className="reactor-btn"
                  disabled={tapLocked || user.energy <= 0}
                >
                  <span>Tap to Harvest</span>
                  <strong>SHARD</strong>
                  <small>
                    {tapLocked
                      ? "Senkronize ediliyor"
                      : user.energy > 0
                      ? "Reaktörü tetikle"
                      : "Enerji doluyor"}
                  </small>
                </motion.button>
              </div>

              <div className="meter-area">
                <div className="meter-row">
                  <span>Enerji</span>
                  <span>
                    {user.energy}/{user.maxEnergy}
                  </span>
                </div>
                <div className="meter-track">
                  <div className="meter-fill" style={{ width: `${energyProgress}%` }} />
                </div>

                <div className="meter-row space-top">
                  <span>Seviye ilerlemesi</span>
                  <span>
                    {user.xp}/{xpNeed} XP
                  </span>
                </div>
                <div className="meter-track">
                  <div className="meter-fill alt" style={{ width: `${xpProgress}%` }} />
                </div>
              </div>

              <div className="mini-grid">
                <MiniCard icon={<Rocket size={15} />} label="Booster" value={user.boosterMinutes > 0 ? `${user.boosterMinutes} dk` : "Kapalı"} />
                <MiniCard icon={<Target size={15} />} label="Crit" value={`${user.critChance.toFixed(1)}%`} />
                <MiniCard icon={<Medal size={15} />} label="Streak" value={`${user.streak} gün`} />
                <MiniCard icon={<Lock size={15} />} label="Rarity" value={`${user.rarityScore}`} />
              </div>
            </section>

            <section className="card content-card">
              <div className="tabs">
                {([
                  ["command", "Komuta"],
                  ["growth", "Gelişim"],
                  ["market", "Market"],
                  ["missions", "Görevler"],
                  ["intel", "İstihbarat"],
                ] as [TabId, string][]).map(([id, label]) => (
                  <button
                    key={id}
                    className={tab === id ? "tab active" : "tab"}
                    onClick={() => setTab(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "command" && (
                <div className="grid-three">
                  {characters.map((character) => {
                    const active = user.character === character.id;
                    return (
                      <button
                        key={character.id}
                        className={active ? "character-card active" : "character-card"}
                        onClick={() => setUser((prev) => ({ ...prev, character: character.id }))}
                      >
                        <div
                          className="character-top"
                          style={{
                            background: `linear-gradient(135deg, ${character.colorA}22, ${character.colorB}18)`,
                          }}
                        >
                          <div>
                            <div className="character-name">{character.id}</div>
                            <div className="character-role">{character.title}</div>
                          </div>
                          <span className="chip dark">{character.codename}</span>
                        </div>

                        <p>{character.story}</p>

                        <div className="character-foot">
                          <span>{character.passive}</span>
                          <strong>{character.signature}</strong>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {tab === "growth" && (
                <div className="grid-two">
                  {upgrades.map((upgrade) => {
                    const Icon = upgrade.icon;
                    const cost = getUpgradeCost(upgrade);

                    return (
                      <div key={upgrade.id} className="upgrade-card">
                        <div className="upgrade-head">
                          <div className="upgrade-icon">
                            <Icon size={18} />
                          </div>

                          <div>
                            <h3>{upgrade.name}</h3>
                            <p>{upgrade.description}</p>
                          </div>
                        </div>

                        <div className="upgrade-meta">
                          <span>Seviye {upgrade.level}</span>
                          <span>{upgrade.effectText}</span>
                        </div>

                        <button className="action-btn" onClick={() => buyUpgrade(upgrade.id)}>
                          Yükselt • {format(cost)}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {tab === "market" && (
                <div className="grid-two">
                  <div className="market-stack">
                    {marketCatalog.map((item) => (
                      <div key={item.id} className="market-item">
                        <div>
                          <div className="market-title">{item.name}</div>
                          <div className="market-desc">{item.description}</div>
                        </div>

                        <div className="market-side">
                          <span className="chip gold">{item.tag}</span>
                          <button className="action-btn slim" onClick={() => buyMarketItem(item)}>
                            Al • {format(item.price)}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="side-panel">
                    <h3>Günlük akış</h3>
                    <p>
                      Her gün kasanı, kredi rezervini ve streak zincirini büyüt. Hızlı
                      büyüme market + görev + tap üçlüsünden gelir.
                    </p>
                    <button className="action-btn" onClick={claimDaily} disabled={dailyClaimed}>
                      {dailyClaimed ? "Günlük ödül alındı" : "Günlük ödülü al"}
                    </button>
                    <button className="action-btn ghost" onClick={openChest}>
                      Kasa aç • {user.chestCount}
                    </button>
                  </div>
                </div>
              )}

              {tab === "missions" && (
                <div className="mission-stack">
                  {missions.map((mission) => {
                    const progress = (mission.progress / mission.target) * 100;
                    return (
                      <div key={mission.id} className="mission-card">
                        <div className="mission-head">
                          <div>
                            <h3>{mission.title}</h3>
                            <p>{mission.description}</p>
                          </div>
                          <span className="chip">{mission.reward}</span>
                        </div>

                        <div className="meter-track thin">
                          <div className="meter-fill" style={{ width: `${progress}%` }} />
                        </div>

                        <div className="mission-foot">
                          <span>
                            {mission.progress}/{mission.target}
                          </span>
                          <button className="action-btn slim" onClick={() => claimMission(mission.id)}>
                            Talep et
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {tab === "intel" && (
                <div className="grid-two">
                  <div className="chart-card">
                    <div className="chart-title">Haftalık hasat</div>
                    <div className="chart-wrap">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="earnFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ffd56d" stopOpacity={0.45} />
                              <stop offset="95%" stopColor="#ffd56d" stopOpacity={0.03} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                          <XAxis
                            dataKey="day"
                            stroke="rgba(255,255,255,0.5)"
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="rgba(255,255,255,0.5)"
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "#0d1220",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: 14,
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="earn"
                            stroke="#ffd56d"
                            fill="url(#earnFill)"
                            strokeWidth={3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="chart-card">
                    <div className="chart-title">Tap yoğunluğu</div>
                    <div className="chart-wrap">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                          <XAxis
                            dataKey="day"
                            stroke="rgba(255,255,255,0.5)"
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="rgba(255,255,255,0.5)"
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "#0d1220",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: 14,
                            }}
                          />
                          <Bar dataKey="taps" fill="#6be9ff" radius={[10, 10, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="right-stack">
            <section className="card sidebar-card">
              <div className="eyebrow">İmza karakter</div>
              <h3>{activeCharacter.id}</h3>
              <div className="hero-tagline">{activeCharacter.title}</div>
              <p>{activeCharacter.story}</p>
              <div className="side-chip-grid">
                <span className="chip">{activeCharacter.role}</span>
                <span className="chip gold">{activeCharacter.passive}</span>
              </div>
            </section>

            <section className="card sidebar-card">
              <div className="eyebrow">Öne çıkan özellikler</div>
              <div className="feature-list">
                {featureRows.map(([label, value]) => (
                  <div key={label} className="feature-row">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="card sidebar-card">
              <div className="eyebrow">Neden farklı?</div>
              <div className="bullet-list">
                <div>
                  <Star size={15} />
                  Tap + pasif gelir + market + görev tek döngüde birleşir.
                </div>
                <div>
                  <Trophy size={15} />
                  Karakterler kopya değil, şehir içindeki ekonomi rollerine göre yazıldı.
                </div>
                <div>
                  <Gift size={15} />
                  Günlük ödül, kasa, credit ve seviye sistemi dengeli ilerler.
                </div>
                <div>
                  <Activity size={15} />
                  Arayüz canlı ama okunaklı; neon tema görüntüyü boğmaz.
                </div>
              </div>
            </section>

            <section className="card sidebar-card accent">
              <div className="eyebrow">Eklenen ana sistemler</div>
              <div className="system-grid">
                {[
                  "Tap harvesting",
                  "Combo scaling",
                  "XP & level",
                  "Passive income",
                  "Character switch",
                  "Daily reward",
                  "Chest opening",
                  "Upgrade economy",
                  "Premium credits",
                  "Boost timer",
                  "Mission loop",
                  "Charts & intel",
                  "Critical hits",
                  "Rarity score",
                  "Streak logic",
                  "Energy regen",
                  "Dynamic costs",
                  "Reward tiers",
                  "Lore layer",
                  "Original identity",
                ].map((item) => (
                  <span key={item} className="system-pill">
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        {icon}
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}

function MiniCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="mini-card">
      <div className="mini-label">
        {icon}
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
    </div>
  );
}

const shellStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #040711 0%, #081120 48%, #040711 100%)",
};

const css = `
* { box-sizing: border-box; }
html, body, #root {
  margin: 0;
  min-height: 100%;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #eef4ff;
}
button { font: inherit; }
.wrap {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
  position: relative;
  z-index: 2;
}
.ambient {
  position: fixed;
  border-radius: 999px;
  filter: blur(120px);
  opacity: .65;
  pointer-events: none;
}
.ambient-a {
  width: 420px;
  height: 420px;
  top: -80px;
  left: -80px;
  background: rgba(255, 199, 90, .22);
}
.ambient-b {
  width: 520px;
  height: 520px;
  right: -140px;
  top: 10%;
  background: rgba(107, 233, 255, .18);
}
.ambient-c {
  width: 460px;
  height: 460px;
  left: 30%;
  bottom: -180px;
  background: rgba(179, 92, 255, .14);
}
.card {
  background: linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.025));
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 28px;
  box-shadow: 0 24px 80px rgba(0,0,0,.35);
  backdrop-filter: blur(22px);
}
.hero {
  display: grid;
  grid-template-columns: 1.28fr .92fr;
  gap: 22px;
  padding: 28px;
  margin-bottom: 22px;
}
.hero h1 {
  margin: 16px 0 10px;
  font-size: clamp(44px, 8vw, 86px);
  line-height: .92;
  letter-spacing: -.06em;
  background: linear-gradient(180deg, #fff 0%, #ffe7a6 44%, #98eeff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero-copy {
  max-width: 760px;
  margin: 0;
  color: rgba(238,244,255,.76);
  font-size: 19px;
  line-height: 1.8;
}
.chip-row,
.side-chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.08);
  font-size: 12px;
  font-weight: 700;
}
.chip.dark {
  background: rgba(9, 14, 26, .72);
}
.chip.gold {
  background: rgba(255,213,109,.14);
  border-color: rgba(255,213,109,.26);
  color: #ffe39e;
}
.chip.success {
  background: rgba(87, 255, 173, .1);
  border-color: rgba(87, 255, 173, .22);
  color: #b3ffd5;
}
.story-box {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 22px;
}
.story-box > div {
  border-radius: 20px;
  background: rgba(255,255,255,.035);
  border: 1px solid rgba(255,255,255,.06);
  padding: 16px;
}
.story-kicker,
.eyebrow {
  display: inline-block;
  color: #8fe8ff;
  text-transform: uppercase;
  letter-spacing: .18em;
  font-size: 11px;
  font-weight: 800;
}
.story-box strong {
  display: block;
  margin-top: 8px;
  font-size: 18px;
}
.story-box p {
  color: rgba(238,244,255,.68);
  line-height: 1.7;
  margin: 8px 0 0;
  font-size: 14px;
}
.hero-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-self: center;
}
.stat-card {
  min-height: 116px;
  border-radius: 22px;
  background: rgba(255,255,255,.045);
  border: 1px solid rgba(255,255,255,.07);
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.stat-label,
.mini-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(238,244,255,.66);
  font-size: 12px;
  font-weight: 700;
}
.stat-card strong {
  font-size: 24px;
  line-height: 1;
  letter-spacing: -.04em;
}
.stat-card small {
  color: rgba(238,244,255,.52);
}
.layout {
  display: grid;
  grid-template-columns: 1.68fr .92fr;
  gap: 22px;
}
.left-stack,
.right-stack {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.reactor-panel {
  padding: 24px;
}
.content-card {
  padding: 18px;
}
.section-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.section-head h2 {
  margin: 6px 0 8px;
  font-size: 34px;
  letter-spacing: -.04em;
}
.section-head p {
  margin: 0;
  color: rgba(238,244,255,.7);
  line-height: 1.75;
}
.badge-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}
.pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.08);
  font-size: 12px;
  font-weight: 700;
}
.reactor-zone {
  min-height: 380px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.06);
  background:
    radial-gradient(circle at 50% 50%, rgba(255,213,109,.14), transparent 20%),
    radial-gradient(circle at 50% 50%, rgba(107,233,255,.08), transparent 38%),
    linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.015));
}
.reactor-zone::before,
.reactor-zone::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  border: 1px solid rgba(107,233,255,.12);
}
.reactor-zone::before {
  width: 290px;
  height: 290px;
}
.reactor-zone::after {
  width: 390px;
  height: 390px;
  border-color: rgba(255,213,109,.12);
}
.reactor-btn {
  width: 230px;
  height: 230px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.22);
  background:
    radial-gradient(circle at 30% 28%, rgba(255,255,255,.35), rgba(255,255,255,.08) 25%, transparent 36%),
    linear-gradient(180deg, #ffd977 0%, #ffb83b 52%, #ff7b46 100%);
  color: #1e1306;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0 0 40px rgba(255,190,86,.28), 0 0 120px rgba(255,190,86,.12);
  font-weight: 900;
  position: relative;
  z-index: 2;
}
.reactor-btn span {
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: .24em;
  opacity: .78;
}
.reactor-btn strong {
  font-size: 54px;
  letter-spacing: -.05em;
  line-height: 1;
}
.reactor-btn small {
  font-size: 13px;
  opacity: .78;
}
.reactor-btn:disabled {
  opacity: .72;
  cursor: not-allowed;
}
.float-gain {
  position: absolute;
  color: #ffd977;
  font-size: 28px;
  font-weight: 900;
  text-shadow: 0 0 28px rgba(255, 213, 109, .4);
  z-index: 3;
}
.meter-area {
  margin-top: 18px;
}
.meter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(238,244,255,.72);
  font-size: 14px;
}
.space-top {
  margin-top: 14px;
}
.meter-track {
  width: 100%;
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.04);
  margin-top: 10px;
}
.meter-track.thin {
  height: 10px;
}
.meter-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd56d, #ff9048);
  box-shadow: 0 0 18px rgba(255,213,109,.22);
}
.meter-fill.alt {
  background: linear-gradient(90deg, #6be9ff, #b35cff);
  box-shadow: 0 0 18px rgba(107,233,255,.18);
}
.mini-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
}
.mini-card {
  border-radius: 18px;
  padding: 14px;
  background: rgba(255,255,255,.035);
  border: 1px solid rgba(255,255,255,.06);
}
.mini-card strong {
  display: block;
  margin-top: 10px;
  font-size: 17px;
}
.tabs {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}
.tab {
  min-height: 48px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.04);
  color: #eef4ff;
  cursor: pointer;
  font-weight: 800;
}
.tab.active {
  background: linear-gradient(135deg, rgba(255,213,109,.22), rgba(107,233,255,.12));
  color: #fff2c4;
  border-color: rgba(255,213,109,.3);
}
.grid-three {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.grid-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.character-card,
.upgrade-card,
.market-item,
.mission-card,
.chart-card,
.sidebar-card {
  background: rgba(255,255,255,.035);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 22px;
}
.character-card {
  padding: 16px;
  text-align: left;
  color: #eef4ff;
  cursor: pointer;
}
.character-card.active {
  border-color: rgba(255,213,109,.34);
  box-shadow: 0 12px 34px rgba(255,213,109,.08);
}
.character-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
}
.character-name {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -.03em;
}
.character-role {
  font-size: 13px;
  color: rgba(238,244,255,.7);
  margin-top: 4px;
}
.character-card p {
  margin: 14px 0;
  line-height: 1.75;
  color: rgba(238,244,255,.72);
}
.character-foot {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
}
.character-foot span {
  color: #8ef2c2;
}
.character-foot strong {
  color: #ffdca1;
}
.upgrade-card {
  padding: 18px;
}
.upgrade-head {
  display: flex;
  gap: 14px;
}
.upgrade-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(255,213,109,.12);
  color: #ffd56d;
}
.upgrade-head h3,
.market-title,
.mission-head h3,
.sidebar-card h3 {
  margin: 0;
  font-size: 20px;
  letter-spacing: -.03em;
}
.upgrade-head p,
.market-desc,
.mission-head p,
.sidebar-card p {
  margin: 6px 0 0;
  color: rgba(238,244,255,.68);
  line-height: 1.7;
}
.upgrade-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin: 14px 0;
  color: rgba(238,244,255,.68);
  font-size: 13px;
}
.action-btn {
  min-height: 46px;
  border-radius: 14px;
  border: 1px solid rgba(255,213,109,.26);
  background: linear-gradient(180deg, rgba(255,213,109,.2), rgba(255,213,109,.08));
  color: #fff0bf;
  cursor: pointer;
  padding: 0 16px;
  font-weight: 800;
}
.action-btn.ghost {
  margin-top: 10px;
  width: 100%;
  background: rgba(255,255,255,.05);
  border-color: rgba(255,255,255,.08);
  color: #eef4ff;
}
.action-btn.slim {
  min-height: 40px;
}
.market-stack,
.mission-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.market-item,
.mission-card {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
}
.market-side {
  min-width: 148px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}
.side-panel {
  padding: 20px;
  border-radius: 22px;
  background: rgba(255,255,255,.035);
  border: 1px solid rgba(255,255,255,.06);
}
.side-panel h3 {
  margin: 0 0 8px;
  font-size: 22px;
}
.side-panel p {
  margin: 0 0 16px;
  line-height: 1.75;
  color: rgba(238,244,255,.7);
}
.mission-head,
.mission-foot {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}
.mission-foot {
  align-items: center;
  margin-top: 12px;
}
.chart-card {
  padding: 18px;
}
.chart-title {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 12px;
}
.chart-wrap {
  height: 280px;
}
.sidebar-card {
  padding: 18px;
}
.hero-tagline {
  margin-top: 8px;
  color: #ffdca1;
  font-weight: 700;
}
.feature-list,
.bullet-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
}
.feature-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.feature-row:last-child {
  border-bottom: none;
}
.feature-row span {
  color: rgba(238,244,255,.72);
}
.bullet-list div {
  display: flex;
  gap: 10px;
  line-height: 1.7;
  color: rgba(238,244,255,.76);
}
.sidebar-card.accent {
  background:
    linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.03)),
    radial-gradient(circle at top right, rgba(107,233,255,.12), transparent 30%),
    radial-gradient(circle at bottom left, rgba(179,92,255,.14), transparent 30%);
}
.system-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
.system-pill {
  padding: 10px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.08);
  font-size: 12px;
  font-weight: 700;
}
@media (max-width: 1180px) {
  .hero,
  .layout,
  .grid-three,
  .grid-two {
    grid-template-columns: 1fr;
  }
  .hero-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 760px) {
  .wrap {
    padding: 14px;
  }
  .hero,
  .reactor-panel,
  .content-card,
  .sidebar-card,
  .card {
    padding: 18px;
  }
  .hero-stats,
  .story-box,
  .mini-grid,
  .tabs {
    grid-template-columns: 1fr;
  }
  .section-head,
  .mission-head,
  .mission-foot,
  .market-item,
  .market-side {
    flex-direction: column;
    align-items: stretch;
  }
  .badge-stack {
    align-items: flex-start;
  }
  .reactor-zone {
    min-height: 320px;
  }
  .reactor-btn {
    width: 190px;
    height: 190px;
  }
  .reactor-btn strong {
    font-size: 42px;
  }
}
`;