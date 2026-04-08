import { useEffect, useMemo, useState } from 'react';

type Tab = 'empire' | 'shop' | 'chests' | 'missions' | 'social';
type UpgradeKey =
  | 'tapPower'
  | 'comboMastery'
  | 'critEngine'
  | 'autoMiner'
  | 'tradeDesk'
  | 'quantumRig'
  | 'vipVault';

type UpgradeDef = {
  key: UpgradeKey;
  title: string;
  description: string;
  baseCost: number;
  scaling: number;
  cap: number;
};

type Mission = {
  id: string;
  title: string;
  target: number;
  reward: number;
  type: 'taps' | 'coins' | 'chests' | 'upgrades';
};

type GameState = {
  coins: number;
  totalEarned: number;
  level: number;
  xp: number;
  prestige: number;
  premiumGems: number;
  taps: number;
  combo: number;
  bestCombo: number;
  chestKeys: number;
  chestCount: number;
  currentEventIndex: number;
  lastEventRotation: number;
  lastSavedAt: number;
  lastActiveAt: number;
  upgrades: Record<UpgradeKey, number>;
  missionsCompleted: string[];
};

const STORAGE_KEY = 'adn-crypto-empire-pro-pack-v1';

const upgradeDefs: UpgradeDef[] = [
  {
    key: 'tapPower',
    title: 'Lion Gloves',
    description: 'Her tap daha sert vurur. Direkt tap gelirini artırır.',
    baseCost: 25,
    scaling: 1.55,
    cap: 80
  },
  {
    key: 'comboMastery',
    title: 'Combo Pulse',
    description: 'Combo daha hızlı büyür ve daha geç söner.',
    baseCost: 120,
    scaling: 1.72,
    cap: 40
  },
  {
    key: 'critEngine',
    title: 'Critical Engine',
    description: 'Kritik vuruş oranını ve çarpanını yükseltir.',
    baseCost: 300,
    scaling: 1.85,
    cap: 30
  },
  {
    key: 'autoMiner',
    title: 'Street Miner',
    description: 'Saniye başına pasif ADN kazandırır.',
    baseCost: 500,
    scaling: 1.9,
    cap: 50
  },
  {
    key: 'tradeDesk',
    title: 'Trade Desk',
    description: 'Tüm gelirler için global multiplier sağlar.',
    baseCost: 1500,
    scaling: 2.05,
    cap: 25
  },
  {
    key: 'quantumRig',
    title: 'Quantum Rig',
    description: 'Chest ve event ödüllerini büyütür.',
    baseCost: 7500,
    scaling: 2.2,
    cap: 20
  },
  {
    key: 'vipVault',
    title: 'VIP Vault',
    description: 'Premium ekonomi katmanı. Gem üretir ve level kilidi açar.',
    baseCost: 25000,
    scaling: 2.35,
    cap: 10
  }
];

const levelThresholds = [0, 100, 350, 900, 2000, 4200, 8200, 14500, 24000, 38000, 56000, 78000, 110000];

const events = [
  {
    name: 'Bull Run Night',
    description: 'Tap gelirleri 20 dakika boyunca x1.35.',
    tapBoost: 1.35,
    passiveBoost: 1,
    chestBoost: 1
  },
  {
    name: 'Mining Rush',
    description: 'Pasif gelirler güçlenir.',
    tapBoost: 1,
    passiveBoost: 1.65,
    chestBoost: 1
  },
  {
    name: 'Whale Fever',
    description: 'Chest ödülleri büyür ve jackpot hissi artar.',
    tapBoost: 1,
    passiveBoost: 1,
    chestBoost: 1.6
  }
] as const;

const missions: Mission[] = [
  { id: 'tap-100', title: '100 Tap tamamla', target: 100, reward: 150, type: 'taps' },
  { id: 'coin-5k', title: '5.000 ADN kazan', target: 5000, reward: 450, type: 'coins' },
  { id: 'upgrade-10', title: '10 upgrade satın al', target: 10, reward: 2, type: 'upgrades' },
  { id: 'chest-5', title: '5 chest aç', target: 5, reward: 3, type: 'chests' }
];

const format = (value: number) =>
  Intl.NumberFormat('tr-TR', {
    notation: value >= 100000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 100000 ? 1 : 0
  }).format(Math.floor(value));

const getInitialState = (): GameState => ({
  coins: 0,
  totalEarned: 0,
  level: 1,
  xp: 0,
  prestige: 0,
  premiumGems: 0,
  taps: 0,
  combo: 0,
  bestCombo: 0,
  chestKeys: 1,
  chestCount: 0,
  currentEventIndex: 0,
  lastEventRotation: Date.now(),
  lastSavedAt: Date.now(),
  lastActiveAt: Date.now(),
  upgrades: {
    tapPower: 0,
    comboMastery: 0,
    critEngine: 0,
    autoMiner: 0,
    tradeDesk: 0,
    quantumRig: 0,
    vipVault: 0
  },
  missionsCompleted: []
});

const loadGame = (): GameState => {
  const base = getInitialState();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return base;
  try {
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return {
      ...base,
      ...parsed,
      upgrades: { ...base.upgrades, ...(parsed.upgrades ?? {}) },
      missionsCompleted: parsed.missionsCompleted ?? []
    };
  } catch {
    return base;
  }
};

export default function App() {
  const [tab, setTab] = useState<Tab>('empire');
  const [game, setGame] = useState<GameState>(() => loadGame());
  const [floatingText, setFloatingText] = useState<{ id: number; value: string }[]>([]);
  const [lastTapAt, setLastTapAt] = useState<number>(0);
  const [upgradePurchases, setUpgradePurchases] = useState<number>(0);
  const [toast, setToast] = useState<string>('ADN Crypto Empire aktif. Sistem kayda hazır.');

  const currentEvent = events[game.currentEventIndex];
  const upgradeLevels = game.upgrades;
  const tradeDeskBoost = 1 + upgradeLevels.tradeDesk * 0.18 + game.prestige * 0.25;
  const tapBase = 1 + upgradeLevels.tapPower * 1.3 + game.level * 0.35;
  const comboMultiplier = 1 + game.combo * (0.12 + upgradeLevels.comboMastery * 0.01);
  const critChance = Math.min(0.12 + upgradeLevels.critEngine * 0.012, 0.48);
  const critMultiplier = 3 + upgradeLevels.critEngine * 0.22;
  const passivePerSecond =
    (upgradeLevels.autoMiner * 2.6 + upgradeLevels.vipVault * 4) * tradeDeskBoost * currentEvent.passiveBoost;
  const chestRewardBoost = (1 + upgradeLevels.quantumRig * 0.18 + game.prestige * 0.1) * currentEvent.chestBoost;
  const nextLevelTarget = levelThresholds[Math.min(game.level, levelThresholds.length - 1)] ?? 150000;
  const currentLevelFloor = levelThresholds[Math.max(game.level - 1, 0)] ?? 0;
  const xpProgress = ((game.xp - currentLevelFloor) / Math.max(nextLevelTarget - currentLevelFloor, 1)) * 100;

  const missionProgress = useMemo(() => {
    return {
      'tap-100': game.taps,
      'coin-5k': game.totalEarned,
      'upgrade-10': upgradePurchases,
      'chest-5': game.chestCount
    };
  }, [game.taps, game.totalEarned, game.chestCount, upgradePurchases]);

  useEffect(() => {
    const saved = { ...game, lastSavedAt: Date.now(), lastActiveAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [game]);

  useEffect(() => {
    const now = Date.now();
    const offlineSeconds = Math.floor((now - game.lastActiveAt) / 1000);
    if (offlineSeconds > 10 && passivePerSecond > 0) {
      const cappedSeconds = Math.min(offlineSeconds, 60 * 60 * 8);
      const earned = cappedSeconds * passivePerSecond;
      setGame((prev) => ({
        ...prev,
        coins: prev.coins + earned,
        totalEarned: prev.totalEarned + earned,
        xp: prev.xp + earned * 0.25,
        lastActiveAt: now
      }));
      setToast(`Offline gelir toplandı: +${format(earned)} ADN`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setGame((prev) => {
        const updated: GameState = {
          ...prev,
          coins: prev.coins + passivePerSecond,
          totalEarned: prev.totalEarned + passivePerSecond,
          xp: prev.xp + passivePerSecond * 0.2,
          combo: Math.max(0, prev.combo - (prev.upgrades.comboMastery >= 10 ? 0 : 1))
        };
        return levelUp(updated);
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [passivePerSecond]);

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setGame((prev) => {
        if (Date.now() - prev.lastEventRotation < 1000 * 60 * 20) return prev;
        const next = (prev.currentEventIndex + 1) % events.length;
        return { ...prev, currentEventIndex: next, lastEventRotation: Date.now() };
      });
      setToast(`Yeni event aktif: ${events[(game.currentEventIndex + 1) % events.length].name}`);
    }, 10000);
    return () => window.clearInterval(rotation);
  }, [game.currentEventIndex]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const addFloat = (value: string) => {
    const id = Date.now() + Math.random();
    setFloatingText((prev) => [...prev, { id, value }]);
    window.setTimeout(() => {
      setFloatingText((prev) => prev.filter((item) => item.id !== id));
    }, 850);
  };

  const levelUp = (state: GameState): GameState => {
    let updated = state;
    let didLevel = false;
    while (updated.level < levelThresholds.length && updated.xp >= (levelThresholds[updated.level] ?? Infinity)) {
      updated = {
        ...updated,
        level: updated.level + 1,
        chestKeys: updated.chestKeys + 1,
        premiumGems: updated.premiumGems + (updated.level % 3 === 0 ? 1 : 0)
      };
      didLevel = true;
    }
    if (didLevel) {
      setToast(`Level up! Yeni seviye: ${updated.level}`);
    }
    return updated;
  };

  const handleTap = () => {
    const now = Date.now();
    const chainBoost = now - lastTapAt < 900 ? 1.18 : 1;
    setLastTapAt(now);

    setGame((prev) => {
      const crit = Math.random() < critChance;
      const raw = tapBase * comboMultiplier * tradeDeskBoost * currentEvent.tapBoost * chainBoost;
      const reward = crit ? raw * critMultiplier : raw;
      const updated: GameState = {
        ...prev,
        coins: prev.coins + reward,
        totalEarned: prev.totalEarned + reward,
        taps: prev.taps + 1,
        combo: Math.min(prev.combo + 1, 25 + prev.upgrades.comboMastery),
        bestCombo: Math.max(prev.bestCombo, prev.combo + 1),
        xp: prev.xp + reward * 0.45,
        lastActiveAt: Date.now()
      };
      addFloat(`${crit ? 'CRIT ' : '+'}${format(reward)}`);
      return levelUp(updated);
    });
  };

  const buyUpgrade = (upgrade: UpgradeDef) => {
    const level = game.upgrades[upgrade.key];
    const lockGate = upgrade.key === 'quantumRig' ? 5 : upgrade.key === 'vipVault' ? 8 : 1;
    if (game.level < lockGate) {
      setToast(`Bu upgrade için level ${lockGate} gerekli.`);
      return;
    }
    if (level >= upgrade.cap) {
      setToast('Bu upgrade maksimum seviyede.');
      return;
    }

    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.scaling, level));
    if (game.coins < cost) {
      setToast('Yetersiz ADN. Önce daha fazla kazan.');
      return;
    }

    setGame((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      upgrades: {
        ...prev.upgrades,
        [upgrade.key]: prev.upgrades[upgrade.key] + 1
      },
      lastActiveAt: Date.now()
    }));
    setUpgradePurchases((prev) => prev + 1);
    setToast(`${upgrade.title} satın alındı.`);
  };

  const openChest = (type: 'common' | 'rare' | 'epic') => {
    const keyCost = type === 'common' ? 1 : type === 'rare' ? 2 : 3;
    if (game.chestKeys < keyCost) {
      setToast('Yeterli chest key yok. Level atla veya görev bitir.');
      return;
    }

    const baseReward = type === 'common' ? 250 : type === 'rare' ? 900 : 2500;
    const jackpotChance = type === 'common' ? 0.03 : type === 'rare' ? 0.07 : 0.12;
    const jackpot = Math.random() < jackpotChance;
    const coins = Math.floor(baseReward * chestRewardBoost * (jackpot ? 8 : 1 + Math.random() * 1.4));
    const gems = type === 'epic' || jackpot ? 1 + Math.floor(Math.random() * 2) : 0;

    setGame((prev) =>
      levelUp({
        ...prev,
        chestKeys: prev.chestKeys - keyCost,
        coins: prev.coins + coins,
        totalEarned: prev.totalEarned + coins,
        premiumGems: prev.premiumGems + gems,
        chestCount: prev.chestCount + 1,
        xp: prev.xp + coins * 0.35,
        lastActiveAt: Date.now()
      })
    );
    setToast(jackpot ? `JACKPOT! +${format(coins)} ADN` : `Chest açıldı: +${format(coins)} ADN`);
  };

  const claimMission = (mission: Mission) => {
    if (game.missionsCompleted.includes(mission.id)) {
      setToast('Bu görev zaten alındı.');
      return;
    }

    const progress = missionProgress[mission.id as keyof typeof missionProgress] ?? 0;
    if (progress < mission.target) {
      setToast('Görev henüz tamamlanmadı.');
      return;
    }

    setGame((prev) => ({
      ...prev,
      coins: mission.type === 'upgrades' || mission.type === 'chests' ? prev.coins : prev.coins + mission.reward,
      premiumGems: mission.type === 'upgrades' || mission.type === 'chests' ? prev.premiumGems + mission.reward : prev.premiumGems,
      chestKeys: mission.type === 'chests' ? prev.chestKeys + mission.reward : prev.chestKeys,
      missionsCompleted: [...prev.missionsCompleted, mission.id],
      lastActiveAt: Date.now()
    }));
    setToast(`Görev ödülü alındı: ${mission.reward} ${mission.type === 'upgrades' ? 'GEM' : 'ADN/KEY'}`);
  };

  const prestige = () => {
    if (game.totalEarned < 100000 || game.level < 10) {
      setToast('Prestige için en az 100.000 total earned ve level 10 gerekli.');
      return;
    }

    const gain = Math.max(1, Math.floor(game.totalEarned / 120000));
    const fresh = getInitialState();
    setGame({
      ...fresh,
      prestige: game.prestige + gain,
      premiumGems: game.premiumGems + gain,
      chestKeys: 2 + gain,
      lastActiveAt: Date.now(),
      lastSavedAt: Date.now()
    });
    setUpgradePurchases(0);
    setToast(`Prestige yapıldı. +${gain} empire mark alındı.`);
  };

  return (
    <div className="app-shell">
      <div className="background-orb orb-left" />
      <div className="background-orb orb-right" />
      <div className="container">
        <header className="hero card glass">
          <div>
            <div className="eyebrow">ADN CRYPTO EMPIRE</div>
            <h1>Sokaktan Whale seviyesine çıkan tap economy pack</h1>
            <p>
              Bu paket; progression, retention, chest, prestige, level kilidi, görev ve sosyal katman mantığını tek bir
              çalışan front-end içine koyar. Mevcut sitenin “ADN Token Airdrop” kimliğini daha oyunlaştırılmış bir Empire
              akışına taşımak için tasarlandı. citeturn176299view0
            </p>
          </div>
          <div className="hero-stats">
            <Stat label="ADN" value={format(game.coins)} />
            <Stat label="Level" value={String(game.level)} />
            <Stat label="Prestige" value={String(game.prestige)} />
            <Stat label="Keys" value={String(game.chestKeys)} />
          </div>
        </header>

        <section className="top-grid">
          <article className="card main-panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">Current Event</span>
                <h2>{currentEvent.name}</h2>
              </div>
              <span className="chip chip-hot">{currentEvent.description}</span>
            </div>

            <div className="xp-wrap">
              <div className="xp-meta">
                <span>Empire XP</span>
                <span>
                  {format(game.xp)} / {format(nextLevelTarget)}
                </span>
              </div>
              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${Math.max(0, Math.min(100, xpProgress))}%` }} />
              </div>
            </div>

            <div className="tap-stage">
              {floatingText.map((item) => (
                <span key={item.id} className="floating-text">
                  {item.value}
                </span>
              ))}
              <button className="tap-core" onClick={handleTap}>
                <span>ADN</span>
                <strong>TAP TO RULE</strong>
              </button>
            </div>

            <div className="metrics-grid">
              <MiniMetric label="Tap gelir" value={`${format(tapBase * comboMultiplier * tradeDeskBoost)} ADN`} />
              <MiniMetric label="Crit chance" value={`${(critChance * 100).toFixed(1)}%`} />
              <MiniMetric label="Pasif gelir" value={`${format(passivePerSecond)}/sn`} />
              <MiniMetric label="Best combo" value={`x${game.bestCombo}`} />
            </div>
          </article>

          <aside className="card side-panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">Empire Control</span>
                <h2>Hızlı görünüm</h2>
              </div>
            </div>
            <ul className="bullet-stats">
              <li>Total earned <strong>{format(game.totalEarned)}</strong></li>
              <li>Toplam tap <strong>{format(game.taps)}</strong></li>
              <li>Chest açıldı <strong>{format(game.chestCount)}</strong></li>
              <li>Trade desk boost <strong>x{tradeDeskBoost.toFixed(2)}</strong></li>
            </ul>
            <button className="secondary-btn" onClick={prestige}>Prestige Reset</button>
            <p className="fine-print">100.000 total earned ve level 10 sonrası empire mark biriktirir.</p>
          </aside>
        </section>

        <nav className="tabs card glass">
          {[
            ['empire', 'Empire'],
            ['shop', 'Shop'],
            ['chests', 'Chests'],
            ['missions', 'Missions'],
            ['social', 'Social']
          ].map(([key, label]) => (
            <button
              key={key}
              className={tab === key ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setTab(key as Tab)}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === 'empire' && (
          <section className="content-grid">
            <article className="card">
              <h3>Empire identity</h3>
              <p>
                Oyun kimliği tap-to-earn değil, “rise to power” hissi verir. Erken safhada hızlı büyüme, orta safhada
                yatırım kararları, geç safhada prestige ve VIP ekonomi açılır.
              </p>
              <div className="identity-grid">
                <MiniMetric label="Phase 1" value="Street Hustle" />
                <MiniMetric label="Phase 2" value="Trading Desk" />
                <MiniMetric label="Phase 3" value="Whale Control" />
                <MiniMetric label="Phase 4" value="Empire Reset" />
              </div>
            </article>
            <article className="card">
              <h3>Ekonomi tasarımı</h3>
              <p>
                Erken oyunda tap önemlidir. Orta oyunda auto miner ve trade desk oyunu taşır. Geç oyunda chest, gems ve
                prestige birleşip kullanıcıyı daha uzun tutar.
              </p>
              <ul className="bullet-stats compact">
                <li>Hızlı başlangıç için düşük ilk upgrade maliyeti</li>
                <li>Snowball etkisi için global multiplier katmanı</li>
                <li>Hemen bitmemesi için level gate ve upgrade cap</li>
                <li>Reset sonrası tekrar oynanma için prestige economy</li>
              </ul>
            </article>
          </section>
        )}

        {tab === 'shop' && (
          <section className="content-grid upgrades-grid">
            {upgradeDefs.map((upgrade) => {
              const level = game.upgrades[upgrade.key];
              const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.scaling, level));
              const lockGate = upgrade.key === 'quantumRig' ? 5 : upgrade.key === 'vipVault' ? 8 : 1;
              const locked = game.level < lockGate;
              return (
                <article key={upgrade.key} className="card upgrade-card">
                  <div className="panel-header">
                    <div>
                      <span className="eyebrow">LV {level}/{upgrade.cap}</span>
                      <h3>{upgrade.title}</h3>
                    </div>
                    {locked ? <span className="chip">Level {lockGate}</span> : <span className="chip chip-hot">Open</span>}
                  </div>
                  <p>{upgrade.description}</p>
                  <div className="upgrade-footer">
                    <span className="price">{format(cost)} ADN</span>
                    <button className="secondary-btn" onClick={() => buyUpgrade(upgrade)}>
                      Satın al
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {tab === 'chests' && (
          <section className="content-grid upgrades-grid">
            <ChestCard title="Common Chest" text="Hızlı ekonomi ivmesi." cost="1 key" onOpen={() => openChest('common')} />
            <ChestCard title="Rare Chest" text="Orta oyun hızlandırıcı." cost="2 key" onOpen={() => openChest('rare')} />
            <ChestCard title="Epic Chest" text="Gem ve jackpot şansı daha yüksek." cost="3 key" onOpen={() => openChest('epic')} />
          </section>
        )}

        {tab === 'missions' && (
          <section className="content-grid upgrades-grid">
            {missions.map((mission) => {
              const progress = missionProgress[mission.id as keyof typeof missionProgress] ?? 0;
              const done = progress >= mission.target;
              const claimed = game.missionsCompleted.includes(mission.id);
              return (
                <article key={mission.id} className="card mission-card">
                  <div className="panel-header">
                    <div>
                      <span className="eyebrow">Mission</span>
                      <h3>{mission.title}</h3>
                    </div>
                    <span className={done ? 'chip chip-hot' : 'chip'}>{claimed ? 'Claimed' : done ? 'Ready' : 'Progress'}</span>
                  </div>
                  <div className="xp-bar slim">
                    <div className="xp-fill" style={{ width: `${Math.min((progress / mission.target) * 100, 100)}%` }} />
                  </div>
                  <div className="upgrade-footer">
                    <span className="price">
                      {format(progress)} / {format(mission.target)}
                    </span>
                    <button className="secondary-btn" onClick={() => claimMission(mission)}>
                      Ödülü al
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {tab === 'social' && (
          <section className="content-grid">
            <article className="card">
              <h3>Referral layer</h3>
              <p>
                Paket içinde backend yok ama akış hazır: her davet için VIP boost, haftalık leaderboard ve clan contribution
                mantığı bu ekrana bağlanabilir.
              </p>
              <div className="identity-grid">
                <MiniMetric label="Invite reward" value="+5 keys" />
                <MiniMetric label="Referral share" value="%8 boost" />
                <MiniMetric label="Clan bonus" value="x1.15" />
                <MiniMetric label="VIP gate" value="Lvl 8" />
              </div>
            </article>
            <article className="card">
              <h3>Monetization logic</h3>
              <ul className="bullet-stats compact">
                <li>Chest key pack</li>
                <li>Starter bundle</li>
                <li>VIP Vault unlock</li>
                <li>Event pass</li>
              </ul>
              <p className="fine-print">
                Bu paket monetization mantığını hazırlar; ödeme altyapısı ve gerçek envanter API bağlantısı ayrıca eklenir.
              </p>
            </article>
          </section>
        )}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-box">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ChestCard({ title, text, cost, onOpen }: { title: string; text: string; cost: string; onOpen: () => void }) {
  return (
    <article className="card upgrade-card chest-card">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Chest</span>
          <h3>{title}</h3>
        </div>
        <span className="chip chip-hot">{cost}</span>
      </div>
      <p>{text}</p>
      <button className="secondary-btn" onClick={onOpen}>
        Aç
      </button>
    </article>
  );
}
