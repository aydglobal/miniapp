export const springs = {
  button: { type: "spring" as const, stiffness: 380, damping: 24 },
  card: { type: "spring" as const, stiffness: 280, damping: 22 },
  panel: { type: "spring" as const, stiffness: 240, damping: 26 },
};

export const fades = {
  up: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 }
  }
};

export const tapPulse = {
  idle: { scale: 1, rotate: 0 },
  press: { scale: [1, 1.08, 0.98, 1], rotate: [0, -1, 1, 0] }
};

export const rewardFloat = {
  initial: { opacity: 0, y: 0, scale: 0.92 },
  animate: { opacity: [0, 1, 1, 0], y: -48, scale: [0.92, 1, 1] },
  transition: { duration: 1.05, ease: "easeOut" }
};
