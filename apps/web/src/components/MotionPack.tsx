import React from "react";
import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import liongiftImg from "../assets/liongift.jpg";

type ScreenTransitionProps = {
  screenKey: string;
  children: React.ReactNode;
};

type TapMotionButtonProps = HTMLMotionProps<"button"> & {
  energy?: number;
  busy?: boolean;
  children: React.ReactNode;
};

type MotionCardProps = HTMLMotionProps<"div"> & {
  active?: boolean;
  children: React.ReactNode;
};

type ChestRevealMotionProps = {
  open: boolean;
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
  jackpot?: boolean;
  rewards: { adn: number; shards: number; boostMinutes: number };
  onDone?: () => void;
};

const rarityGlow: Record<ChestRevealMotionProps["rarity"], string> = {
  common: "0 0 40px rgba(148,163,184,0.18)",
  rare: "0 0 44px rgba(56,189,248,0.22)",
  epic: "0 0 48px rgba(168,85,247,0.24)",
  legendary: "0 0 56px rgba(246,196,83,0.28)",
  mythic: "0 0 68px rgba(236,72,153,0.30)",
};

const rarityGradient: Record<ChestRevealMotionProps["rarity"], string> = {
  common: "linear-gradient(135deg, rgba(148,163,184,0.24), rgba(71,85,105,0.24))",
  rare: "linear-gradient(135deg, rgba(56,189,248,0.26), rgba(14,165,233,0.20))",
  epic: "linear-gradient(135deg, rgba(168,85,247,0.28), rgba(139,92,246,0.20))",
  legendary: "linear-gradient(135deg, rgba(246,196,83,0.30), rgba(255,183,3,0.22))",
  mythic: "linear-gradient(135deg, rgba(236,72,153,0.32), rgba(139,92,246,0.22))",
};

export function ScreenTransition({ screenKey, children }: ScreenTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={screenKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        style={{ width: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function TapMotionButton({
  energy = 1,
  busy = false,
  children,
  style,
  ...props
}: TapMotionButtonProps) {
  const disabled = props.disabled || energy <= 0 || busy;

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.015, y: -2 }}
      whileTap={
        disabled
          ? undefined
          : {
              scale: 0.955,
              rotateX: 8,
              rotateY: -8,
            }
      }
      transition={{ duration: 0.15 }}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
        filter: disabled ? "saturate(0.78)" : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function MotionCard({ active = false, children, style, ...props }: MotionCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -4,
        boxShadow: active
          ? "0 22px 56px rgba(246,196,83,0.18)"
          : "0 18px 44px rgba(0,0,0,0.26)",
      }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.18 }}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ChestRevealMotion({
  open,
  rarity,
  jackpot,
  rewards,
  onDone,
}: ChestRevealMotionProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="chest-reveal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            display: "grid",
            placeItems: "center",
            padding: 20,
            background: "radial-gradient(circle at center, rgba(0,0,0,0.42), rgba(0,0,0,0.76))",
            backdropFilter: "blur(10px)",
          }}
          onClick={onDone}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.72, rotate: -10, y: 30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.86, y: 14 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              width: "min(100%, 420px)",
              borderRadius: 30,
              padding: 24,
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "linear-gradient(180deg, rgba(20,28,49,0.88), rgba(8,12,24,0.96))",
              boxShadow: rarityGlow[rarity],
              position: "relative",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ opacity: [0.45, 0.85, 0.45], scale: [0.94, 1.06, 0.94] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                inset: -40,
                borderRadius: 999,
                background: rarityGradient[rarity],
                filter: "blur(28px)",
                pointerEvents: "none",
              }}
            />

            <motion.div
              initial={{ scale: 0.88 }}
              animate={{
                scale: [1, 1.06, 1],
                rotate: jackpot ? [0, -2, 2, 0] : 0,
              }}
              transition={{
                duration: jackpot ? 0.8 : 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                position: "relative",
                width: 160,
                height: 160,
                margin: "0 auto 18px",
                borderRadius: 28,
                overflow: "hidden",
                boxShadow: rarityGlow[rarity],
              }}
            >
              <img
                src={liongiftImg}
                alt="Lion Gift"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 28,
                  display: "block",
                }}
              />
              {/* Rarity overlay */}
              <div style={{
                position: "absolute",
                inset: 0,
                borderRadius: 28,
                background: rarityGradient[rarity],
                mixBlendMode: "overlay",
                pointerEvents: "none",
              }} />
              {jackpot && (
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 28,
                    background: "rgba(246,196,83,0.4)",
                    pointerEvents: "none",
                  }}
                />
              )}
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              style={{ position: "relative", margin: "0 0 8px", textAlign: "center", fontSize: 28, letterSpacing: "-0.03em" }}
            >
              {jackpot ? "JACKPOT!" : "CHEST OPENED"}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.86, y: 0 }}
              transition={{ delay: 0.18 }}
              style={{ position: "relative", margin: "0 0 18px", textAlign: "center", color: "#cbd5e1" }}
            >
              {rarity.toUpperCase()} reward pack unlocked
            </motion.p>

            <div style={{ position: "relative", display: "grid", gap: 10, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
              {[
                { label: "ADN", value: rewards.adn },
                { label: "Shards", value: rewards.shards },
                { label: "Boost", value: `${rewards.boostMinutes}m` },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 14, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.22 + index * 0.08 }}
                  style={{
                    borderRadius: 18,
                    padding: 14,
                    textAlign: "center",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{item.value}</div>
                </motion.div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDone}
              style={{
                position: "relative",
                width: "100%",
                marginTop: 18,
                minHeight: 48,
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                cursor: "pointer",
                background: "linear-gradient(180deg, rgba(246,196,83,0.22), rgba(56,189,248,0.12))",
              }}
            >
              Collect rewards
            </motion.button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
