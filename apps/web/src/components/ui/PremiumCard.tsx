import React from "react";
import { motion } from "framer-motion";
import { fades, springs } from "../../motion/motionPresets";

type Props = React.PropsWithChildren<{
  className?: string;
  highlight?: "gold" | "cyan" | "none";
  animate?: boolean;
}>;

export function PremiumCard({ className = "", highlight = "none", animate = false, children }: Props) {
  const glow =
    highlight === "gold"
      ? "shadow-[0_0_0_1px_rgba(255,209,102,0.16),0_0_32px_rgba(255,209,102,0.22)]"
      : highlight === "cyan"
      ? "shadow-[0_0_0_1px_rgba(77,226,255,0.16),0_0_32px_rgba(77,226,255,0.18)]"
      : "shadow-[0_12px_30px_rgba(0,0,0,0.28)]";

  const inner = (
    <div
      className={[
        "rounded-[24px] border border-white/10 bg-white/[0.06] backdrop-blur-xl",
        "relative overflow-hidden",
        glow,
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))]" />
      <div className="relative">{children}</div>
    </div>
  );

  if (!animate) return inner;

  return (
    <motion.div
      {...fades.up}
      transition={{ ...springs.card, duration: 0.3 }}
    >
      {inner}
    </motion.div>
  );
}
