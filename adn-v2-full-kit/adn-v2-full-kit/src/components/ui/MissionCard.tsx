import React from "react";
import { motion } from "framer-motion";
import Button from "./Button";
import ProgressBar from "./ProgressBar";

type MissionStatus = "active" | "inProgress" | "claimable" | "completed";
type Props = {
  reward: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  status: MissionStatus;
  onAction?: () => void;
};

export default function MissionCard({ reward, title, description, progress, maxProgress, status, onAction }: Props) {
  const label = status === "claimable" ? "Claim Reward" : status === "completed" ? "Completed" : "Go Mission";
  const isClaimable = status === "claimable";

  return (
    <motion.div
      className={`adn-panel adn-interactive p-5 relative overflow-hidden ${isClaimable ? "adn-glow-gold" : ""}`}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {isClaimable && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl"
          style={{ background: "linear-gradient(90deg, transparent, #ffd700, transparent)" }}
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="adn-badge adn-badge-gold">{reward}</div>
        <div className={`adn-badge ${isClaimable ? "adn-badge-active" : ""}`}>{status}</div>
      </div>
      <div className="mt-4 text-lg font-bold" style={{ color: "#e8f4ff" }}>{title}</div>
      <p className="mt-1 text-sm" style={{ color: "#8ba8cc" }}>{description}</p>
      <div className="mt-4">
        <ProgressBar value={progress} max={maxProgress} variant="gold" />
        <div className="mt-1 flex justify-between text-xs" style={{ color: "#5a7a9e" }}>
          <span>{progress}</span>
          <span>{maxProgress}</span>
        </div>
      </div>
      <Button
        variant={isClaimable ? "gold" : "secondary"}
        className="mt-4 w-full"
        disabled={status === "completed"}
        onClick={onAction}
      >
        {label}
      </Button>
    </motion.div>
  );
}
