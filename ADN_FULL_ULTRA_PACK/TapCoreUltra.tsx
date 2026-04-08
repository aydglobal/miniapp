import { motion } from "framer-motion";
import { useState } from "react";

export default function TapCoreUltra({ onTap }: { onTap: () => void }) {
  const [floating, setFloating] = useState<any[]>([]);

  const handleTap = (e: any) => {
    onTap();

    const id = Date.now();
    const x = e.clientX;
    const y = e.clientY;

    setFloating((prev) => [...prev, { id, x, y }]);

    setTimeout(() => {
      setFloating((prev) => prev.filter((f) => f.id !== id));
    }, 800);

    const audio = new Audio("/sounds/tap.mp3");
    audio.volume = 0.2;
    audio.play();

    if (window?.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
    }
  };

  return (
    <div className="tap-container" onClick={handleTap}>
      <motion.div
        className="tap-orb"
        whileTap={{ scale: 1.2 }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />

      {floating.map((f) => (
        <motion.div
          key={f.id}
          className="floating"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -80 }}
          transition={{ duration: 0.8 }}
          style={{ left: f.x, top: f.y }}
        >
          +1 ADN
        </motion.div>
      ))}
    </div>
  );
}
