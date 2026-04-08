import React from "react";
import { motion } from "framer-motion";

type Props = { label: string; value: string; help?: string; rightBadge?: string };

export default function StatCard({ label, value, help, rightBadge }: Props) {
  return (
    <motion.div
      className="adn-panel adn-interactive p-4"
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="adn-label">{label}</div>
          <div className="adn-stat-value mt-2">{value}</div>
          {help ? <div className="adn-stat-help">{help}</div> : null}
        </div>
        {rightBadge ? (
          <div className="adn-badge adn-badge-active">{rightBadge}</div>
        ) : null}
      </div>
    </motion.div>
  );
}
