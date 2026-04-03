import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Flame, Gem, Shield, Sparkles, Zap } from "lucide-react";

type CharacterId = "Neonix Prime" | "Astra Lyn" | "Kairo Vex";
type TabId = "tap" | "gelisim" | "market";

type Character = {
  id: CharacterId;
  role: string;
  bonusText: string;
  colorA: string;
  colorB: string;
};

type Player = {
  name: string;
  character: CharacterId;
  shards: number;
  energy: number;
  maxEnergy: number;
  tapPower: number;
  passiveRate: number;
  critChance: number;
  combo: number;
  level: number;
  xp: number;
  boosterMinutes: number;
};

const characters: Character[] = [
  {
    id: "Neonix Prime",
    role: "Marka karakteri",
    bonusText: "+12% tap gücü",
    colorA: "#6cf8ff",
    colorB: "#3b8dff",
  },
  {
    id: "Astra Lyn",
    role: "Hız avcısı",
    bonusText: "+15% kritik şans",
    colorA: "#7effaf",
    colorB: "#1fb473",
  },
  {
    id: "Kairo Vex",
    role: "Sabit gelir",
    bonusText: "+20% pasif gelir",
    colorA: "#ffe173",
    colorB: "#ff8a43",
  },
];

const ENERGY_REGEN_MS = 2500;
const PASSIVE_TICK_MS = 3000;
const TAP_COOLDOWN_MS = 260;
const BOOST_TICK_MS = 60000;

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function levelNeed(level: number): number {
  return 140 + level * 75;
}

function format(n: number): string {
  return new Intl.NumberFormat("tr-TR").format(Math.floor(n));
}

function getCharacter(id: CharacterId): Character {
  return characters.find((c) => c.id === id) ?? characters[0];
}

function applyLeveling(player: Player): Player {
  let next = { ...player };
  let need = levelNeed(next.level);

  while (next.xp >= need) {
    next = {
      ...next,
      level: next.level + 1,
      xp: next.xp - need,
      tapPower: next.tapPower + 1,
      passiveRate: next.passiveRate + 1,
      maxEnergy: next.maxEnergy + 2,
      critChance: clamp(next.critChance + 0.35, 5, 45),
    };
    need = levelNeed(next.level);
  }

  return next;
}

export default function App() {
  const [tab, setTab] = useState<TabId>("tap");
  const [player, setPlayer] = useState<Player>({
    name: "ArctisOne",
    character: "Neonix Prime",
    shards: 1200,
    energy: 80,
    maxEnergy: 100,
    tapPower: 8,
    passiveRate: 9,
    critChance: 12,
    combo: 0,
    level: 1,
    xp: 0,
    boosterMinutes: 0,
  });

  const [tapLocked, setTapLocked] = useState(false);
  const [floatText, setFloatText] = useState<string>("");
  const tapLockRef = useRef(0);

  const activeChar = useMemo(() => getCharacter(player.character), [player.character]);
  const need = useMemo(() => levelNeed(player.level), [player.level]);
  const xpPct = useMemo(() => (player.xp / need) * 100, [player.xp, need]);
  const energyPct = useMemo(() => (player.energy / player.maxEnergy) * 100, [player.energy, player.maxEnergy]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPlayer((prev) => ({ ...prev, energy: clamp(prev.energy + 1, 0, prev.maxEnergy) }));
    }, ENERGY_REGEN_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPlayer((prev) => {
        const charPassive = prev.character === "Kairo Vex" ? 1.2 : 1;
        const boost = prev.boosterMinutes > 0 ? 1.6 : 1;
        const gain = Math.round(prev.passiveRate * charPassive * boost);
        return applyLeveling({ ...prev, shards: prev.shards + gain, xp: prev.xp + Math.round(gain * 0.45) });
      });
    }, PASSIVE_TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPlayer((prev) => ({ ...prev, boosterMinutes: Math.max(0, prev.boosterMinutes - 1) }));
    }, BOOST_TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  const doTap = () => {
    const now = Date.now();
    if (tapLocked || now - tapLockRef.current < TAP_COOLDOWN_MS || player.energy <= 0) return;
    tapLockRef.current = now;
    setTapLocked(true);

    const comboMult = 1 + clamp(player.combo, 0, 20) * 0.02;
    const neonixBonus = player.character === "Neonix Prime" ? 1.12 : 1;
    const astraCrit = player.character === "Astra Lyn" ? 1.15 : 1;
    const critRate = clamp(player.critChance * astraCrit, 5, 50);
    const crit = Math.random() * 100 < critRate ? 1.7 : 1;
    const boost = player.boosterMinutes > 0 ? 1.6 : 1;
    const gain = Math.round(player.tapPower * comboMult * neonixBonus * crit * boost);

    setPlayer((prev) =>
      applyLeveling({
        ...prev,
        shards: prev.shards + gain,
        energy: clamp(prev.energy - 1, 0, prev.maxEnergy),
        combo: clamp(prev.combo + 1, 0, 25),
        xp: prev.xp + Math.round(gain * 0.7),
      })
    );

    setFloatText(`+${gain}`);
    window.setTimeout(() => setFloatText(""), 700);
    window.setTimeout(() => setTapLocked(false), TAP_COOLDOWN_MS);
  };

  const buyTapUpgrade = () => {
    const cost = Math.round(220 + player.tapPower * 55);
    if (player.shards < cost) return;
    setPlayer((prev) => ({ ...prev, shards: prev.shards - cost, tapPower: prev.tapPower + 1 }));
  };

  const buyPassiveUpgrade = () => {
    const cost = Math.round(260 + player.passiveRate * 60);
    if (player.shards < cost) return;
    setPlayer((prev) => ({ ...prev, shards: prev.shards - cost, passiveRate: prev.passiveRate + 1 }));
  };

  const buyBoost = () => {
    const cost = 700;
    if (player.shards < cost) return;
    setPlayer((prev) => ({ ...prev, shards: prev.shards - cost, boosterMinutes: prev.boosterMinutes + 10 }));
  };

  return (
    <div style={shellStyle}>
      <style>{css}</style>
      <div className="page">
        <header className="header card">
          <div>
            <p className="eyebrow">Futuristik Tap Arena</p>
            <h1>NEONIX TAP</h1>
            <p className="subtitle">Ana ekran sade, aksiyon net: karaktere dokun, shard topla, güçlen.</p>
          </div>
          <div className="stats">
            <span><Gem size={14} /> {format(player.shards)} Shard</span>
            <span><Zap size={14} /> {player.energy}/{player.maxEnergy} Enerji</span>
            <span><Crown size={14} /> Seviye {player.level}</span>
          </div>
        </header>

        <nav className="tabs">
          <button className={tab === "tap" ? "active" : ""} onClick={() => setTab("tap")}>Tap</button>
          <button className={tab === "gelisim" ? "active" : ""} onClick={() => setTab("gelisim")}>Gelişim</button>
          <button className={tab === "market" ? "active" : ""} onClick={() => setTab("market")}>Market</button>
        </nav>

        {tab === "tap" && (
          <section className="tap-grid">
            <div className="card tap-panel">
              <div className="meter-row"><span>Enerji</span><span>{player.energy}/{player.maxEnergy}</span></div>
              <div className="meter"><div className="fill" style={{ width: `${energyPct}%` }} /></div>
              <div className="meter-row top-gap"><span>XP</span><span>{player.xp}/{need}</span></div>
              <div className="meter"><div className="fill alt" style={{ width: `${xpPct}%` }} /></div>

              <div className="tap-zone">
                {floatText && <motion.div className="float" initial={{ y: 10, opacity: 0 }} animate={{ y: -70, opacity: 1 }} exit={{ opacity: 0 }}>{floatText}</motion.div>}
                <motion.button whileTap={{ scale: 0.95 }} className="hero-char" onClick={doTap} disabled={tapLocked || player.energy <= 0}>
                  <span className="kicker">Özel Marka Karakteri</span>
                  <strong>{activeChar.id}</strong>
                  <small>{tapLocked ? "Senkron..." : "Dokun ve shard topla"}</small>
                </motion.button>
              </div>

              <div className="mini-stats">
                <div><Flame size={14} /> Tap Gücü: {player.tapPower}</div>
                <div><Shield size={14} /> Pasif Gelir: {player.passiveRate}/tick</div>
                <div><Sparkles size={14} /> Kritik: %{player.critChance.toFixed(1)}</div>
              </div>
            </div>

            <div className="card side-panel">
              <h3>Karakterler</h3>
              <p className="hint">Her karakter farklı oyun stili verir.</p>
              <div className="char-list">
                {characters.map((c) => (
                  <button key={c.id} className={player.character === c.id ? "char active" : "char"} onClick={() => setPlayer((prev) => ({ ...prev, character: c.id }))}>
                    <span>{c.id}</span>
                    <small>{c.role}</small>
                    <em>{c.bonusText}</em>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === "gelisim" && (
          <section className="card simple-panel">
            <h3>Dengeli Seviye ve Kazanç</h3>
            <p>İlerleme kademeli: erken oyunda hızlı, orta oyunda kontrollü, geç oyunda strateji odaklı.</p>
            <div className="actions">
              <button onClick={buyTapUpgrade}>Tap yükselt ({format(Math.round(220 + player.tapPower * 55))})</button>
              <button onClick={buyPassiveUpgrade}>Pasif yükselt ({format(Math.round(260 + player.passiveRate * 60))})</button>
            </div>
          </section>
        )}

        {tab === "market" && (
          <section className="card simple-panel">
            <h3>Hızlı Market</h3>
            <p>10 dakikalık boost ile zorlandığın aşamaları geç.</p>
            <div className="actions">
              <button onClick={buyBoost}>Boost al (700 shard)</button>
            </div>
            <p className="hint">Aktif boost: {player.boosterMinutes} dk</p>
          </section>
        )}
      </div>
    </div>
  );
}

const shellStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 15% 10%, rgba(74,198,255,.25), transparent 32%), radial-gradient(circle at 88% 20%, rgba(255,150,70,.18), transparent 28%), linear-gradient(180deg,#050b16 0%,#060f22 52%,#040812 100%)",
};

const css = `
* { box-sizing: border-box; }
html, body, #root { margin: 0; min-height: 100%; font-family: "Space Grotesk", "Segoe UI", sans-serif; color: #e9f8ff; }
.page { max-width: 1100px; margin: 0 auto; padding: 20px; display: grid; gap: 14px; }
.card { background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03)); border: 1px solid rgba(142,215,255,.2); border-radius: 18px; box-shadow: 0 14px 42px rgba(0,0,0,.45); }
.header { padding: 18px; display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
.eyebrow { text-transform: uppercase; letter-spacing: .16em; font-size: 11px; color: #89eeff; margin: 0 0 6px; }
h1 { margin: 0; font-size: clamp(30px, 6vw, 56px); line-height: .95; letter-spacing: -.04em; background: linear-gradient(135deg, #d8fbff, #6af0ff, #ffd77a); -webkit-background-clip: text; color: transparent; }
.subtitle { margin: 10px 0 0; color: rgba(232,247,255,.8); }
.stats { display: grid; gap: 8px; font-size: 13px; }
.stats span { display: inline-flex; align-items: center; gap: 7px; padding: 8px 10px; border-radius: 999px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.14); }

.tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.tabs button { min-height: 44px; border: 1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.05); color: #e9f8ff; border-radius: 12px; font-weight: 700; cursor: pointer; }
.tabs button.active { background: linear-gradient(135deg, rgba(108,248,255,.22), rgba(255,138,67,.14)); border-color: rgba(108,248,255,.45); }

.tap-grid { display: grid; grid-template-columns: 1.45fr .85fr; gap: 14px; }
.tap-panel { padding: 16px; }
.meter-row { display: flex; justify-content: space-between; font-size: 13px; color: rgba(232,247,255,.8); }
.top-gap { margin-top: 10px; }
.meter { width: 100%; height: 10px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.1); border-radius: 999px; overflow: hidden; margin-top: 8px; }
.fill { height: 100%; background: linear-gradient(90deg, #6cf8ff, #3b8dff); }
.fill.alt { background: linear-gradient(90deg, #ffe173, #ff8a43); }

.tap-zone { min-height: 300px; border-radius: 16px; margin-top: 14px; border: 1px solid rgba(255,255,255,.12); display: grid; place-items: center; position: relative; background: radial-gradient(circle at 50% 46%, rgba(108,248,255,.16), transparent 34%); }
.hero-char { width: 250px; height: 250px; border-radius: 50%; border: 1px solid rgba(255,255,255,.3); background: linear-gradient(180deg, #8cf9ff, #5abfff 45%, #6a89ff); color: #061124; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font-weight: 800; box-shadow: 0 0 40px rgba(108,248,255,.28); }
.hero-char strong { font-size: 32px; text-align: center; line-height: 1.1; padding: 0 14px; }
.hero-char .kicker { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; opacity: .86; }
.hero-char small { opacity: .8; }
.hero-char:disabled { opacity: .72; cursor: not-allowed; }
.float { position: absolute; top: 44%; color: #9ffcff; font-size: 28px; font-weight: 900; text-shadow: 0 0 20px rgba(108,248,255,.5); }

.mini-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 12px; }
.mini-stats div { border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.04); border-radius: 12px; padding: 10px; font-size: 13px; display: inline-flex; align-items: center; gap: 7px; }

.side-panel { padding: 16px; }
h3 { margin: 0; font-size: 22px; }
.hint { color: rgba(232,247,255,.72); }
.char-list { display: grid; gap: 10px; margin-top: 10px; }
.char { text-align: left; border: 1px solid rgba(255,255,255,.13); background: rgba(255,255,255,.05); color: #e9f8ff; border-radius: 12px; padding: 12px; cursor: pointer; display: grid; gap: 4px; }
.char small { color: rgba(232,247,255,.7); }
.char em { color: #98f6ff; font-style: normal; font-size: 12px; }
.char.active { border-color: rgba(108,248,255,.45); background: rgba(108,248,255,.1); }

.simple-panel { padding: 16px; }
.actions { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
.actions button { min-height: 42px; border-radius: 12px; border: 1px solid rgba(108,248,255,.42); background: linear-gradient(180deg, rgba(108,248,255,.2), rgba(108,248,255,.08)); color: #e9f8ff; font-weight: 700; cursor: pointer; padding: 0 14px; }

@media (max-width: 900px) {
  .tap-grid { grid-template-columns: 1fr; }
  .mini-stats { grid-template-columns: 1fr; }
}
`;
