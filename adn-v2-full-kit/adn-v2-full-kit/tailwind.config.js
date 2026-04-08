/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg-main)",
        soft: "var(--bg-soft)",
        panel: "var(--bg-panel)",
        panelStrong: "var(--bg-panel-strong)",
        text: "var(--text-main)",
        muted: "var(--text-secondary)",
        softText: "var(--text-soft)",
        primary: "var(--primary)",
        primaryStrong: "var(--primary-strong)",
        secondary: "var(--secondary)",
        secondaryStrong: "var(--secondary-strong)",
        gold: "var(--gold)",
        goldStrong: "var(--gold-strong)",
        danger: "var(--danger)",
        success: "var(--success)",
        warning: "var(--warning)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
        glow: "var(--shadow-glow)",
        glowPurple: "var(--shadow-glow-purple)",
        glowGold: "var(--shadow-glow-gold)",
      },
      borderRadius: {
        xl2: "20px",
        xl3: "28px",
      },
    },
  },
  plugins: [],
};
