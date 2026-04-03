import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gem, Zap, Trophy, Wallet, Users, Rocket, 
  Gift, Sparkles, BadgeDollarSign, RefreshCcw 
} from 'lucide-react';
import './App.css';

// Karakter Görseli (Daha önce tasarladığımız lüks kıyafetli aslan)
import adnLionRich from './assets/adn_lion_rich.png';

interface PlayerState {
  adnTokens: number;
  energy: number;
  maxEnergy: number;
  level: number;
  xp: number;
  tapValue: number;
  hourlyIncome: number;
}

interface TapEffect {
  id: number;
  x: number;
  y: number;
  value: number;
}

export default function App() {
  const [player, setPlayer] = useState<PlayerState>({
    adnTokens: 500,
    energy: 1000,
    maxEnergy: 1000,
    level: 1,
    xp: 0,
    tapValue: 10,
    hourlyIncome: 100,
  });

  const [taps, setTaps] = useState<TapEffect[]>([]);
  const lastTapRef = useRef(0);

  // 1. Enerji ve Pasif Gelir Döngüsü
  useEffect(() => {
    const timer = setInterval(() => {
      setPlayer(prev => ({
        ...prev,
        adnTokens: prev.adnTokens + (prev.hourlyIncome / 3600),
        energy: Math.min(prev.maxEnergy, prev.energy + 1.5)
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Tıklama Fonksiyonu (Hata Düzeltilmiş & Akıcı)
  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 50 || player.energy < player.tapValue) return;
    
    lastTapRef.current = now;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const newTap = { id: now, x: clientX, y: clientY, value: player.tapValue };
    setTaps(prev => [...prev, newTap]);

    setPlayer(prev => ({
      ...prev,
      adnTokens: prev.adnTokens + prev.tapValue,
      energy: prev.energy - 1,
      xp: prev.xp + 1
    }));

    // Telegram Titreşim Desteği
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }

    setTimeout(() => {
      setTaps(prev => prev.filter(t => t.id !== newTap.id));
    }, 800);
  };

  const energyProgress = (player.energy / player.maxEnergy) * 100;

  return (
    <div className="app-container">
      <div className="vfx-stars" />
      
      {/* Üst Bilgi Kartı */}
      <header className="main-header glass">
        <div className="brand-box">
          <Gem className="neon-icon" />
          <div className="brand-text">
            <strong>ADN NEBULA</strong>
            <span>GOLD EDITION</span>
          </div>
        </div>
        <div className="level-badge">
          <Trophy size={16} />
          <span>LVL {player.level}</span>
        </div>
      </header>

      {/* Skor ve Pasif Gelir */}
      <section className="stats-zone">
        <div className="token-display">
          <img src="https://i.ibb.co/L6M0hS8/adn-coin.png" alt="coin" className="coin-spin" />
          <h1>{Math.floor(player.adnTokens).toLocaleString()}</h1>
        </div>
        <div className="income-pill glass">
          <RefreshCcw size={14} />
          <span>Saatlik Kazanç: +{player.hourlyIncome}</span>
        </div>
      </section>

      {/* Ana Karakter Sahnesi */}
      <main className="stage">
        <AnimatePresence>
          {taps.map(tap => (
            <motion.span
              key={tap.id}
              initial={{ opacity: 1, y: tap.y - 50, x: tap.x - 20 }}
              animate={{ opacity: 0, y: tap.y - 200 }}
              className="floating-text"
            >
              +{tap.value}
            </motion.span>
          ))}
        </AnimatePresence>

        <motion.div 
          className="character-wrapper"
          whileTap={{ scale: 0.92, rotate: 2 }}
          onPointerDown={handleTap}
        >
          <img src={adnLionRich} alt="ADN Rich Lion" className="lion-hero" />
          <div className="glow-base" />
        </motion.div>
      </main>

      {/* Enerji Barı */}
      <footer className="footer-controls">
        <div className="energy-card glass">
          <div className="energy-info">
            <div className="label"><Zap size={14} /> Enerji</div>
            <div className="val">{Math.floor(player.energy)} / {player.maxEnergy}</div>
          </div>
          <div className="bar-container">
            <div className="bar-fill" style={{ width: `${energyProgress}%` }} />
          </div>
        </div>

        {/* Alt Menü */}
        <nav className="bottom-nav glass">
          <button className="nav-btn"><Rocket /><span>Market</span></button>
          <button className="nav-btn"><Users /><span>Ekip</span></button>
          <button className="nav-btn active"><Sparkles /><span>ADN</span></button>
          <button className="nav-btn"><Gift /><span>Görev</span></button>
          <button className="nav-btn"><Wallet /><span>Cüzdan</span></button>
        </nav>
      </footer>
    </div>
  );
}