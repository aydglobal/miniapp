import React from "react";
import { motion } from "framer-motion";
import Button from "./Button";

type Props = { title: string; subtitle: string; timeLeft: string };

export default function EventBanner({ title, subtitle, timeLeft }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="adn-panel-strong p-5 relative overflow-hidden"
    >
      {/* Animated shimmer stripe */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,215,0,0.04) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 3s linear infinite",
        }}
      />
      {/* Gold top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl"
        style={{ background: "linear-gradient(90deg, transparent, #ffd700, transparent)" }}
      />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="adn-label" style={{ color: "#ffd700", opacity: 0.9 }}>Live Event</div>
          <div className="mt-2 text-2xl font-bold" style={{ color: "#e8f4ff" }}>{title}</div>
          <p className="mt-1 text-sm" style={{ color: "#8ba8cc" }}>{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="adn-badge adn-badge-gold animate-soft-pulse"
            style={{ fontSize: 12, fontWeight: 700 }}
          >
            ⏱ {timeLeft}
          </div>
          <Button variant="gold">Join Event</Button>
        </div>
      </div>
    </motion.div>
  );
}
