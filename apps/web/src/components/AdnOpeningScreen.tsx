import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import startlionImg from "../assets/startlion.jpg";
import adnTokenImg from "../assets/adn-token-clean.png";

type Lang = "tr" | "en" | "ru" | "de" | "fr" | "es" | "ar" | "zh" | "ja" | "ko";

const T: Record<Lang, { earlyAccess: string; title: string; tagline: string; enterBtn: string; litepaper: string; balance: string; combo: string; daily: string; comboReady: string; level: string }> = {
  tr: { earlyAccess: "Erken Erişim", title: "ADN Ödül Motoru", tagline: "Tap. Büyü. Hükmet.", enterBtn: "ADN'YE GİR", litepaper: "Litepaper", balance: "Bakiye", combo: "Combo", daily: "Günlük", comboReady: "Hazır", level: "Seviye" },
  en: { earlyAccess: "Early Access", title: "ADN Reward Engine", tagline: "Tap. Scale. Dominate.", enterBtn: "ENTER ADN", litepaper: "Litepaper", balance: "Balance", combo: "Combo", daily: "Daily", comboReady: "Ready", level: "Level" },
  ru: { earlyAccess: "Ранний доступ", title: "ADN Движок наград", tagline: "Тапай. Расти. Доминируй.", enterBtn: "ВОЙТИ В ADN", litepaper: "Лайтпейпер", balance: "Баланс", combo: "Комбо", daily: "Ежедневно", comboReady: "Готово", level: "Уровень" },
  de: { earlyAccess: "Früher Zugang", title: "ADN Belohnungsmotor", tagline: "Tippen. Wachsen. Dominieren.", enterBtn: "ADN BETRETEN", litepaper: "Litepaper", balance: "Guthaben", combo: "Kombo", daily: "Täglich", comboReady: "Bereit", level: "Level" },
  fr: { earlyAccess: "Accès anticipé", title: "Moteur ADN", tagline: "Tapez. Évoluez. Dominez.", enterBtn: "ENTRER ADN", litepaper: "Litepaper", balance: "Solde", combo: "Combo", daily: "Quotidien", comboReady: "Prêt", level: "Niveau" },
  es: { earlyAccess: "Acceso anticipado", title: "Motor ADN", tagline: "Toca. Escala. Domina.", enterBtn: "ENTRAR ADN", litepaper: "Litepaper", balance: "Saldo", combo: "Combo", daily: "Diario", comboReady: "Listo", level: "Nivel" },
  ar: { earlyAccess: "وصول مبكر", title: "محرك ADN", tagline: "انقر. انمُ. سيطر.", enterBtn: "ادخل ADN", litepaper: "الورقة البيضاء", balance: "الرصيد", combo: "كومبو", daily: "يومي", comboReady: "جاهز", level: "المستوى" },
  zh: { earlyAccess: "早期访问", title: "ADN 奖励引擎", tagline: "点击。成长。主宰。", enterBtn: "进入 ADN", litepaper: "白皮书", balance: "余额", combo: "连击", daily: "每日", comboReady: "就绪", level: "等级" },
  ja: { earlyAccess: "早期アクセス", title: "ADN リワード", tagline: "タップ。成長。支配。", enterBtn: "ADNに入る", litepaper: "ライトペーパー", balance: "残高", combo: "コンボ", daily: "デイリー", comboReady: "準備完了", level: "レベル" },
  ko: { earlyAccess: "얼리 액세스", title: "ADN 리워드", tagline: "탭. 성장. 지배.", enterBtn: "ADN 입장", litepaper: "라이트페이퍼", balance: "잔액", combo: "콤보", daily: "데일리", comboReady: "준비됨", level: "레벨" },
};

function detectLang(): Lang {
  try {
    const tgLang = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code as string | undefined;
    if (tgLang) { const code = tgLang.split("-")[0].toLowerCase() as Lang; if (code in T) return code; }
  } catch { /* ignore */ }
  const nav = navigator.language?.split("-")[0].toLowerCase() as Lang;
  return nav in T ? nav : "en";
}

function fmt(v: number) { return new Intl.NumberFormat("en-US").format(Math.floor(v)); }

interface Props {
  onEnter: () => void;
  balance?: number;
  level?: number;
  combo?: number;
  dailyRewardAmount?: number;
  dailyRewardProgress?: number;
  onOpenLitepaper?: () => void;
  onClaimDaily?: () => void;
  nextUnlockTitle?: string;
  nextUnlockRemaining?: number;
}

export default function AdnOpeningScreen({ onEnter, balance = 0, level = 1, combo = 0, dailyRewardAmount = 0, dailyRewardProgress = 0, onOpenLitepaper }: Props) {
  const lang = useMemo(() => detectLang(), []);
  const t = T[lang];
  const progress = Math.max(0, Math.min(100, dailyRewardProgress));

  return (
    <div style={{ position: 'relative', height: 'var(--tg-viewport-height, 100vh)', overflow: 'hidden', background: '#07111F', color: '#F3F7FB', fontFamily: 'var(--adn-body-font)', display: 'flex', flexDirection: 'column' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.12), transparent 40%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.1), transparent 40%)', pointerEvents: 'none' }} />

      {/* Topbar */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={adnTokenImg} alt="ADN" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.24em', color: 'rgba(103,232,249,0.8)', margin: 0 }}>{t.earlyAccess}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>{t.title}</div>
          </div>
        </div>
      </motion.div>

      {/* Main content — karakter üstte, metin altta */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', zIndex: 1 }}>

        {/* Karakter bölümü — üst yarı */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
          style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden' }}>
          <img src={startlionImg} alt="ADN Lion" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
          {/* Overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,17,31,0.2), rgba(7,17,31,0.0) 40%, rgba(7,17,31,0.7))', pointerEvents: 'none' }} />

          {/* HUD Pills üstte */}
          <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(9,21,36,0.85)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 14, padding: '6px 12px', backdropFilter: 'blur(12px)' }}>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(103,232,249,0.75)', margin: 0 }}>{t.balance}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#F3F7FB', margin: 0 }}>{fmt(balance)} ADN</div>
          </div>
          <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(14,22,35,0.85)', border: '1px solid rgba(214,178,94,0.3)', borderRadius: 14, padding: '6px 12px', backdropFilter: 'blur(12px)' }}>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(214,178,94,0.75)', margin: 0 }}>{t.level}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#F3F7FB', margin: 0 }}>Lv. {level}</div>
          </div>
          <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(9,21,36,0.85)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 14, padding: '6px 12px', backdropFilter: 'blur(12px)' }}>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(103,232,249,0.75)', margin: 0 }}>{t.combo}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#F3F7FB', margin: 0 }}>x{combo} {t.comboReady}</div>
          </div>
          {/* Günlük ödül */}
          <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(14,22,35,0.85)', border: '1px solid rgba(214,178,94,0.3)', borderRadius: 14, padding: '6px 12px', backdropFilter: 'blur(12px)' }}>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(214,178,94,0.75)', margin: 0 }}>{t.daily}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#ffd700', margin: 0 }}>+{fmt(dailyRewardAmount)} ADN</div>
            <div style={{ marginTop: 4, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.15)' }}>
              <div style={{ height: '100%', width: `${progress}%`, borderRadius: 999, background: 'linear-gradient(90deg, #ffd700, #ffec6e)' }} />
            </div>
          </div>
        </motion.div>

        {/* Alt panel — başlık + CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{ flexShrink: 0, padding: '16px 16px 20px', background: 'rgba(7,17,31,0.95)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--adn-title-font)', fontSize: 'clamp(1.6rem, 7vw, 2.4rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em', color: '#F3F7FB' }}>
            {t.tagline}
          </h2>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <motion.button whileTap={{ scale: 0.97 }}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 20, border: '1px solid rgba(56,189,248,0.3)', background: 'linear-gradient(135deg, #38bdf8, #3b82f6)', padding: '13px 20px', fontSize: 15, fontWeight: 800, color: '#fff', cursor: 'pointer', letterSpacing: '0.04em' }}
              onClick={onEnter}>
              <span>{t.enterBtn}</span>
              <ChevronRight size={18} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }}
              style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', padding: '13px 18px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)', cursor: 'pointer' }}
              onClick={onOpenLitepaper}>
              {t.litepaper}
            </motion.button>
          </div>
          <div style={{ marginTop: 12, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
            ADN TOKEN © 2026
          </div>
        </motion.div>
      </div>
    </div>
  );
}
