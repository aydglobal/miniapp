import React from "react";
import { motion } from "framer-motion";
import { PremiumCard } from "./PremiumCard";
import { fades, springs } from "../../motion/motionPresets";

type Props = {
  title: string;
  subtitle: string;
  badge?: string;
};

export function HeroHeader({ title, subtitle, badge = "LIVE AIRDROP" }: Props) {
  return (
    <motion.div {...fades.up} transition={springs.panel}>
      <PremiumCard highlight="cyan" className="p-5">
        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-[11px] font-bold tracking-[0.24em] text-white/72">
          {badge}
        </div>
        <div className="mt-3 text-2xl font-black text-white md:text-4xl">{title}</div>
        <div className="mt-2 max-w-[52ch] text-sm leading-6 text-white/70 md:text-base">{subtitle}</div>
      </PremiumCard>
    </motion.div>
  );
}
