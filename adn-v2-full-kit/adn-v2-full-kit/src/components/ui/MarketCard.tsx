import React from "react";
import { motion } from "framer-motion";
import Button from "./Button";

type Props = {
  category: string;
  title: string;
  level: number;
  currentValue: string;
  nextValue: string;
  cost: string;
  onBuy?: () => void;
};

export default function MarketCard({ category, title, level, currentValue, nextValue, cost, onBuy }: Props) {
  return (
    <motion.div
      className="adn-panel adn-interactive p-5"
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="adn-badge">{category}</div>
        <div className="adn-badge adn-badge-active">Lv. {level}</div>
      </div>
      <div className="mt-4 text-lg font-bold" style={{ color: "#e8f4ff" }}>{title}</div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className="font-semibold" style={{ color: "#e8f4ff" }}>{currentValue}</span>
        <span style={{ color: "#5a7a9e" }}>→</span>
        <span className="font-semibold" style={{ color: "#00e5ff", textShadow: "0 0 8px rgba(0,229,255,0.5)" }}>{nextValue}</span>
      </div>
      <Button variant="primary" className="mt-4 w-full" onClick={onBuy}>
        Buy · {cost}
      </Button>
    </motion.div>
  );
}
