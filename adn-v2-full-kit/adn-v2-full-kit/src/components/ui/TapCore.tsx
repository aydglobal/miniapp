import React, { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Particle = { id: number; tx: string; ty: string; color: string };
type Props = { onTap: () => void; floatingGain?: number | null };

const COLORS = ["#00e5ff", "#00b8d9", "#7ef2ff", "#ffffff", "#a5f3fc"];

export default function TapCore({ onTap, floatingGain }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ripple, setRipple] = useState(false);
  const counter = useRef(0);

  const handleTap = useCallback(() => {
    onTap();
    setRipple(true);
    setTimeout(() => setRipple(false), 300);

    const burst: Particle[] = Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * 360;
      const dist = 55 + Math.random() * 35;
      const rad = (angle * Math.PI) / 180;
      return {
        id: ++counter.current,
        tx: `${Math.cos(rad) * dist}px`,
        ty: `${Math.sin(rad) * dist}px`,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    });
    setParticles((p) => [...p, ...burst]);
    setTimeout(() => setParticles((p) => p.filter((x) => !burst.find((b) => b.id === x.id))), 520);
  }, [onTap]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)",
          transform: "scale(1.4)",
        }}
      />

      {/* Ripple on tap */}
      <AnimatePresence>
        {ripple && (
          <motion.div
            key="ripple"
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: "2px solid rgba(0,229,255,0.6)" }}
          />
        )}
      </AnimatePresence>

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none animate-particle"
          style={{
            width: 6,
            height: 6,
            background: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            "--tx": p.tx,
            "--ty": p.ty,
          } as React.CSSProperties}
        />
      ))}

      {/* Main tap button */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.04 }}
        onClick={handleTap}
        className="adn-tap-core animate-tap-breathe relative flex items-center justify-center"
        style={{ zIndex: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <span
          className="text-xl font-black tracking-widest select-none"
          style={{
            color: "#001a26",
            textShadow: "0 1px 0 rgba(255,255,255,0.4)",
            letterSpacing: "0.15em",
          }}
        >
          TAP
        </span>
      </motion.button>

      {/* Floating gain */}
      <AnimatePresence>
        {floatingGain != null && (
          <motion.div
            key={floatingGain + Date.now()}
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -60, opacity: 0, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute font-black"
            style={{
              fontSize: 22,
              color: "#00e5ff",
              textShadow: "0 0 12px rgba(0,229,255,0.8), 0 0 24px rgba(0,229,255,0.4)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            +{floatingGain}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
