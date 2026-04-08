import React from "react";
import { motion } from "framer-motion";
import Button from "./Button";
import ProgressBar from "./ProgressBar";

type Props = { gain: number; ready: boolean; progress: number; onReboot: () => void };

export default function RbrtPanel({ gain, ready, progress, onReboot }: Props) {
  return (
    <motion.div
      className="adn-panel-strong p-5 relative overflow-hidden"
      animate={ready ? { boxShadow: ["0 16px 48px rgba(0,0,0,0.6), 0 0 24px rgba(168,85,247,0.2)", "0 16px 48px rgba(0,0,0,0.6), 0 0 40px rgba(168,85,247,0.45)", "0 16px 48px rgba(0,0,0,0.6), 0 0 24px rgba(168,85,247,0.2)"] } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Purple top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl"
        style={{ background: "linear-gradient(90deg, transparent, #a855f7, transparent)" }}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="adn-label" style={{ color: "#a855f7", opacity: 0.9 }}>RBRT System</div>
          <div className="mt-2 text-2xl font-bold" style={{ color: "#e8f4ff" }}>
            +{gain} Power
          </div>
          <div className="mt-1 text-sm" style={{ color: "#8ba8cc" }}>
            Progress resetlenir, kalıcı güç korunur.
          </div>
        </div>
        <div className={`adn-badge ${ready ? "adn-badge-rbrt animate-soft-pulse" : ""}`}>
          {ready ? "⚡ Ready" : "Charging"}
        </div>
      </div>

      <div className="mt-4">
        <ProgressBar value={progress} variant="rbrt" />
      </div>

      <div className="mt-4">
        <Button
          variant="rbrt"
          onClick={onReboot}
          disabled={!ready}
          className="w-full justify-center"
        >
          {ready ? "⚡ REBOOT NOW" : "REBOOT"}
        </Button>
      </div>
    </motion.div>
  );
}
