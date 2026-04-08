import React from "react";
import { motion } from "framer-motion";
import { springs } from "../../motion/motionPresets";

type Props = {
  onTap: () => void;
  disabled?: boolean;
  label?: string;
  children?: React.ReactNode;
};

export function TapOrb({ onTap, disabled, label = "TAP", children }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      whileHover={{ scale: 1.02 }}
      transition={springs.button}
      onClick={onTap}
      disabled={disabled}
      className="relative mx-auto flex h-56 w-56 items-center justify-center rounded-full border border-white/15 text-white"
      style={{
        background:
          "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22), rgba(255,255,255,0.05) 26%, rgba(77,226,255,0.12) 62%, rgba(255,209,102,0.18) 100%)",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.08), 0 0 42px rgba(77,226,255,0.20), 0 0 70px rgba(255,209,102,0.14), inset 0 10px 30px rgba(255,255,255,0.08)",
      }}
    >
      <div className="absolute inset-4 rounded-full border border-white/10" />
      <div className="absolute inset-8 rounded-full border border-white/10" />
      {children ?? (
        <div className="text-center">
          <div className="text-[14px] uppercase tracking-[0.38em] text-white/60">ADN CORE</div>
          <div className="mt-2 text-4xl font-black">{label}</div>
        </div>
      )}
    </motion.button>
  );
}
