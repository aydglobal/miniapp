import React from "react";
import { motion } from "framer-motion";
import Button from "./Button";

type Props = { name: string; duration: string; maxLevel: number; active?: boolean; remaining?: string };

export default function BoostCard({ name, duration, maxLevel, active = false, remaining }: Props) {
  return (
    <motion.div
      className={`adn-panel adn-interactive p-5 relative overflow-hidden ${active ? "adn-glow" : ""}`}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {active && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl"
          style={{ background: "linear-gradient(90deg, transparent, #00e5ff, transparent)" }}
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className={`adn-badge ${active ? "adn-badge-active" : ""}`}>
          {active ? `⚡ Active · ${remaining}` : "Boost"}
        </div>
        <div className="adn-badge">Max {maxLevel}</div>
      </div>
      <div className="mt-4 text-lg font-bold" style={{ color: "#e8f4ff" }}>{name}</div>
      <div className="mt-1 text-sm" style={{ color: "#8ba8cc" }}>Duration: {duration}</div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button variant="primary" className="w-full">Buy</Button>
        <Button variant="secondary" className="w-full">Free</Button>
        <Button variant="gold" className="w-full">Star</Button>
      </div>
    </motion.div>
  );
}
