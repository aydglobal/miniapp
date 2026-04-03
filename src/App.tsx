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
} from "lucide-react";
import "./App.css";

type CharacterId = "ember" | "vanta" | "lyra";

type UserState = {
  name: string;
  balance: number;
  energy: number;
  maxEnergy: number;
  combo: number;
  rank: string;
  shield: number;
  streak: number;
  boost: number;
  character: CharacterId;
};

type FloatReward = {
  id: number;
  value: number;
};

type CharacterCard = {
  id: CharacterId;
  name: string;
  role: string;
  passive: string;
  description: string;
};

const TAP_COOLDOWN_MS = 450; // daha akıcı his
const ENERGY_REGEN_MS = 6000;

const characterCards: CharacterCard[] = [
  {
    id: "ember",
    name: "Ember",
    role: "Core Runner",
    passive: "+5% enerji yenileme",
    description: "Hızlı, sıcak ve agresif. Tempolu oyuncular için güçlü başlangıç karakteri.",
  },
  {
    id: "vanta",
    name: "Vanta",
    role: "Shadow Analyst",
    passive: "Daha stabil kazanç",
    description: "Daha kontrollü ilerler, ekran hissi daha premium ve savunma odaklıdır.",
  },
  {
    id: "lyra",
    name: "Lyra",
    role: "Pulse Oracle",
    passive: "+10% görev bonusu",
    description: "Etkinlik, görev ve combo odaklı. Daha parlak ve hikâyesi güçlü karakter.",
  },
];

const weeklyIncome = [
  { day: "Pzt", income: 180, taps: 220 },
  { day: "Sal", income: 240, taps: 280 },
  { day: "Çar", income: 315, taps: 360 },
  { day: "Per", income: 350, taps: 400 },
  { day: "Cum", income: 420, taps: 470 },
  { day: "Cmt", income: 510, taps: 560 },
  { day: "Paz", income: 460, taps: 510 },
];

const leaderboard = [
  { id: "#AX-219", title: "Nebula King", score: 31240 },
  { id: "#QN-441", title: "Flux Raider", score: 28610 },
  { id: "#LK-108", title: "Pulse Baron", score: 25530 },
  { id: "#MV-300", title: "Vault Pilot", score: 22440 },
  { id: "#TR-182", title: "Zero Miner", score: 20190 },
];

const missions = [
  { title: "Core Pulse x50", reward: "+120 ADN", progress: 64 },
  { title: "Shield Streak", reward: "+1 Rozet", progress: 38 },
  { title: "Night Vault Run", reward: "+260 ADN", progress: 14 },
];

const initialUser: UserState = {
  name: "Operative Nova",
  balance: 12480,
  energy: 82,
  maxEnergy: 100,
  combo: 0,
  rank: "Gold Orbit",
  shield: 98,
  streak: 8,
  boost: 1.2,
  character: "vanta",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("tr-TR").format(Math.floor(value));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getCharacter(id: CharacterId) {
  return characterCards.find((item) => item.id === id) ?? characterCards[0];
}

function getReward(combo: number, boost: number) {
  const base = 10;
  const comboBonus = combo >= 20 ? 8 : combo >= 10 ? 4 : combo >= 5 ? 2 : 0;
  return Math.round((base + comboBonus) * boost);
}

export default function App() {
  const [user, setUser] = useState<UserState>(initialUser);
  const [activeTab, setActiveTab] = useState<"overview" | "charts" | "missions" | "security">("overview");
  const [tapLocked, setTapLocked] = useState(false);
  const [rewards, setRewards] = useState<FloatReward[]>([]);
  const rewardId = useRef(1);
  const lastTapTime = useRef(0);

  const character = useMemo(() => getCharacter(user.character), [user.character]);
  const energyPercent = useMemo(() => (user.energy / user.maxEnergy) * 100, [user.energy, user.maxEnergy]);
  const totalWeeklyIncome = useMemo(() => weeklyIncome.reduce((sum, item) => sum + item.income, 0), []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setUser((prev) => {
        if (prev.energy >= prev.maxEnergy) return prev;
        const regenBonus = prev.character === "ember" ? 2 : 1;
        return { ...prev, energy: clamp(prev.energy + regenBonus, 0, prev.maxEnergy) };
      });
    }, ENERGY_REGEN_MS);

    return () => window.clearInterval(timer);
  }, []);

  const handleTap = () => {
    const now = Date.now();
    if (tapLocked) return;
    if (now - lastTapTime.current < TAP_COOLDOWN_MS) return;
    if (user.energy <= 0) return;

    lastTapTime.current = now;
    setTapLocked(true);

    const reward = getReward(user.combo, user.boost);
    const newReward: FloatReward = { id: rewardId.current++, value: reward };

    setUser((prev) => ({
      ...prev,
      balance: prev.balance + reward,
      energy: clamp(prev.energy - 1, 0, prev.maxEnergy),
      combo: clamp(prev.combo + 1, 0, 99),
    }));

    setRewards((prev) => [...prev, newReward]);

    window.setTimeout(() => {
      setRewards((prev) => prev.filter((item) => item.id !== newReward.id));
    }, 900);

    window.setTimeout(() => setTapLocked(false), TAP_COOLDOWN_MS);
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <div className="app-container">
        <section className="hero-card glass-card">
          <div>
            <div className="badge-row">
              <span className="mini-badge success"><ShieldCheck size={14} /> Secure UI</span>
              <span className="mini-badge"><Sparkles size={14} /> Modern Tap-to-Earn</span>
            </div>
            <h1>{"ADN Nexus"}</h1>
            <p>
              Modern tema, güçlü animasyonlar, karakter hikâyesi ve daha premium görünümle temizlenmiş kalite sürümü.
            </p>
          </div>

          <div className="stats-grid">
            <StatBox icon={<Coins size={16} />} label="Bakiye" value={`${formatNumber(user.balance)} ADN`} />
            <StatBox icon={<Zap size={16} />} label="Enerji" value={`${user.energy}/${user.maxEnergy}`} />
            <StatBox icon={<Crown size={16} />} label="Lig" value={user.rank} />
            <StatBox icon={<Activity size={16} />} label="Shield" value={`${user.shield}%`} />
          </div>
        </section>

        <div className="main-grid">
          <div className="left-column">
            <section className="glass-card core-card">
              <div className="card-head">
                <div>
                  <h2>Ana Çekirdek</h2>
                  <p>{character.name} ile premium kazanç akışı aktif.</p>
                </div>
                <span className="mini-badge gold">Combo x{user.combo}</span>
              </div>

              <div className="tap-stage">
                <AnimatePresence>
                  {rewards.map((reward, index) => (
                    <motion.div
                      key={reward.id}
                      className="float-reward"
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: -90 - index * 8, scale: 1.05 }}
                      exit={{ opacity: 0, y: -130, scale: 0.8 }}
                      transition={{ duration: 0.8 }}
                    >
                      +{reward.value}
                    </motion.div>
                  ))}
                </AnimatePresence>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  animate={{ rotate: tapLocked ? [0, -1, 1, 0] : 0 }}
                  className="tap-button premium-glow"
                  onClick={handleTap}
                  disabled={tapLocked || user.energy <= 0}
                >
                  <span className="tap-label">Tap to Earn</span>
                  <strong>ADN</strong>
                  <small>{tapLocked ? "İşleniyor" : "Kazancı tetikle"}</small>
                </motion.button>
              </div>

              <div className="energy-panel">
                <div className="row-between">
                  <span>Enerji rezervi</span>
                  <span>{user.energy}/{user.maxEnergy}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${energyPercent}%` }} />
                </div>

                <div className="mini-stats-grid">
                  <MiniStat icon={<Star size={14} />} label="Streak" value={`${user.streak} gün`} />
                  <MiniStat icon={<Rocket size={14} />} label="Boost" value={`x${user.boost.toFixed(1)}`} />
                  <MiniStat icon={<Lock size={14} />} label="Mode" value="Protected" />
                </div>
              </div>
            </section>

            <section className="glass-card">
              <div className="tabs">
                <button className={activeTab === "overview" ? "tab active" : "tab"} onClick={() => setActiveTab("overview")}>Panel</button>
                <button className={activeTab === "charts" ? "tab active" : "tab"} onClick={() => setActiveTab("charts")}>Grafikler</button>
                <button className={activeTab === "missions" ? "tab active" : "tab"} onClick={() => setActiveTab("missions")}>Görevler</button>
                <button className={activeTab === "security" ? "tab active" : "tab"} onClick={() => setActiveTab("security")}>Güvenlik</button>
              </div>

              {activeTab === "overview" && (
                <div className="panel-grid">
                  <InfoCard title="Haftalık Getiri" text={`${formatNumber(totalWeeklyIncome)} ADN`} subtext="+18.4% geçen haftaya göre" />
                  <InfoCard title="Karakter Etkisi" text={character.name} subtext={character.passive} />
                  <InfoCard title="Günlük Durum" text="Stabil kazanç akışı" subtext="Enerji dolumu aktif, tap hissi modernleştirildi." />
                </div>
              )}

              {activeTab === "charts" && (
                <div className="chart-grid">
                  <div className="chart-card">
                    <div className="chart-title">Gelir Trendi</div>
                    <div className="chart-wrap">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyIncome}>
                          <defs>
                            <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f8c35c" stopOpacity={0.45} />
                              <stop offset="95%" stopColor="#f8c35c" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                          <XAxis dataKey="day" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                          <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{
                              background: "rgba(10,15,28,0.96)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: 16,
                            }}
                          />
                          <Area type="monotone" dataKey="income" stroke="#f8c35c" fill="url(#incomeFill)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="chart-card">
                    <div className="chart-title">Tap Yoğunluğu</div>
                    <div className="chart-wrap">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyIncome}>
                          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                          <XAxis dataKey="day" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                          <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{
                              background: "rgba(10,15,28,0.96)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: 16,
                            }}
                          />
                          <Bar dataKey="taps" fill="#53d9ff" radius={[10, 10, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "missions" && (
                <div className="panel-grid">
                  {missions.map((mission) => (
                    <div key={mission.title} className="info-card mission-card">
                      <div className="info-title">{mission.title}</div>
                      <div className="info-value">{mission.reward}</div>
                      <div className="progress-track small">
                        <div className="progress-fill" style={{ width: `${mission.progress}%` }} />
                      </div>
                      <div className="info-sub">%{mission.progress} tamamlandı</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "security" && (
                <div className="security-list">
                  <SecurityItem title="Spam azaltıldı" text="Tap cooldown daha dengeli hale getirildi." />
                  <SecurityItem title="Ekonomi temizlendi" text="Daha kontrollü ödül mantığı kuruldu." />
                  <SecurityItem title="Arayüz sadeleşti" text="Harici UI bağımlılıkları kaldırıldı, kurulum kolaylaştı." />
                  <SecurityItem title="Kalite arttı" text="Tema, kontrast, kart yapıları ve animasyon hissi yükseltildi." />
                </div>
              )}
            </section>
          </div>

          <div className="right-column">
            <section className="glass-card">
              <div className="card-head compact">
                <div>
                  <h2>Karakterler</h2>
                  <p>Uygulamaya kimlik kazandıran hikâye katmanı.</p>
                </div>
              </div>

              <div className="character-list">
                {characterCards.map((item) => (
                  <button
                    key={item.id}
                    className={user.character === item.id ? "character-card active" : "character-card"}
                    onClick={() => setUser((prev) => ({ ...prev, character: item.id }))}
                  >
                    <div className="row-between">
                      <strong>{item.name}</strong>
                      {user.character === item.id && <span className="mini-badge gold">Aktif</span>}
                    </div>
                    <div className="character-role">{item.role}</div>
                    <p>{item.description}</p>
                    <span className="character-passive">Pasif: {item.passive}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="glass-card">
              <div className="card-head compact">
                <div>
                  <h2><Trophy size={18} /> Leaderboard</h2>
                  <p>Maskeli ve daha premium sıralama görünümü.</p>
                </div>
              </div>

              <div className="leaderboard-list">
                {leaderboard.map((item, index) => (
                  <div key={item.id} className="leaderboard-item">
                    <div className="leader-left">
                      <div className="leader-rank">{index + 1}</div>
                      <div>
                        <strong>{item.id}</strong>
                        <span>{item.title}</span>
                      </div>
                    </div>
                    <div className="leader-score">{formatNumber(item.score)} ADN</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card premium-card">
              <div className="premium-top">
                <span className="mini-badge">Neo-cosmic dark glass</span>
                <h3>Kalite artırılmış deneyim</h3>
                <p>Daha iyi kontrast, daha tok tasarım, daha premium buton ve grafik hissi.</p>
              </div>

              <ul className="feature-list">
                <li>Modern koyu tema</li>
                <li>Temiz TypeScript uyumu</li>
                <li>Shadcn gerektirmez</li>
                <li>Animasyonlu tap alanı</li>
                <li>Grafikli ekonomi paneli</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

type StatBoxProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function StatBox({ icon, label, value }: StatBoxProps) {
  return (
    <div className="stat-box">
      <span className="stat-label">{icon} {label}</span>
      <strong>{value}</strong>
    </div>
  );
}

type MiniStatProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function MiniStat({ icon, label, value }: MiniStatProps) {
  return (
    <div className="mini-stat-box">
      <span>{icon} {label}</span>
      <strong>{value}</strong>
    </div>
  );
}

type InfoCardProps = {
  title: string;
  text: string;
  subtext: string;
};

function InfoCard({ title, text, subtext }: InfoCardProps) {
  return (
    <div className="info-card">
      <div className="info-title">{title}</div>
      <div className="info-value">{text}</div>
      <div className="info-sub">{subtext}</div>
    </div>
  );
}

type SecurityItemProps = {
  title: string;
  text: string;
};

function SecurityItem({ title, text }: SecurityItemProps) {
  return (
    <div className="security-item">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}
