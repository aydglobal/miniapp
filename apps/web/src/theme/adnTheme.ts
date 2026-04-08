export const adnTheme = {
  colors: {
    bg0: "#07111F",
    bg1: "#0A1630",
    bg2: "#102246",
    surface: "rgba(255,255,255,0.06)",
    surfaceStrong: "rgba(255,255,255,0.1)",
    border: "rgba(255,255,255,0.10)",
    gold: "#FFD166",
    cyan: "#4DE2FF",
    mint: "#68F6C8",
    pink: "#FF5EA8",
    red: "#FF6B6B",
    text: "#F4F8FF",
    textSoft: "rgba(244,248,255,0.76)",
    textMute: "rgba(244,248,255,0.52)",
    success: "#53E6A8",
    warning: "#FFB84D",
  },
  gradients: {
    appBg: "linear-gradient(180deg, #07111F 0%, #0A1630 38%, #102246 100%)",
    goldCta: "linear-gradient(135deg, #FFD166 0%, #FFB347 100%)",
    cyanPulse: "linear-gradient(135deg, rgba(77,226,255,0.22) 0%, rgba(104,246,200,0.12) 100%)",
    prestige: "linear-gradient(135deg, rgba(255,94,168,0.24) 0%, rgba(77,226,255,0.18) 100%)",
  },
  radius: {
    card: 24,
    button: 18,
    chip: 999,
  },
  shadow: {
    soft: "0 10px 30px rgba(0,0,0,0.28)",
    glowGold: "0 0 0 1px rgba(255,209,102,0.14), 0 0 28px rgba(255,209,102,0.26)",
    glowCyan: "0 0 0 1px rgba(77,226,255,0.16), 0 0 28px rgba(77,226,255,0.22)",
  },
  motion: {
    fast: 0.18,
    base: 0.26,
    soft: 0.36,
  }
} as const;
