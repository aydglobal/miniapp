/**
 * ADN Phase 2 — Upgrade Catalog
 * Tüm upgrade tanımları. Shop service buradan okur.
 */
export type Upgrade = {
  id: string;
  label: string;
  category: "tap" | "passive" | "crit" | "utility" | "social";
  baseCost: number;
  costCurve: number;
  effect: string;
  unlockLevel: number;
};

export const upgradeCatalog: Upgrade[] = [
  { id: "finger_discipline", label: "Finger Discipline", category: "tap",     baseCost: 30,   costCurve: 1.16, effect: "+1 tap",                  unlockLevel: 1  },
  { id: "neural_reflex",     label: "Neural Reflex",     category: "tap",     baseCost: 120,  costCurve: 1.18, effect: "+2 tap",                  unlockLevel: 2  },
  { id: "micro_rig",         label: "Micro Rig",         category: "passive", baseCost: 250,  costCurve: 1.22, effect: "+2 ADN/min",              unlockLevel: 3  },
  { id: "crit_matrix",       label: "Crit Matrix",       category: "crit",    baseCost: 620,  costCurve: 1.24, effect: "+2% crit",                unlockLevel: 5  },
  { id: "cooldown_lab",      label: "Cooldown Lab",      category: "utility", baseCost: 1100, costCurve: 1.24, effect: "-5% chest cooldown",      unlockLevel: 7  },
  { id: "signal_farm",       label: "Signal Farm",       category: "passive", baseCost: 1800, costCurve: 1.26, effect: "+8 ADN/min",              unlockLevel: 8  },
  { id: "rare_magnet",       label: "Rare Magnet",       category: "utility", baseCost: 3200, costCurve: 1.28, effect: "+rare chest odds",        unlockLevel: 10 },
  { id: "tribe_amplifier",   label: "Tribe Amplifier",   category: "social",  baseCost: 6800, costCurve: 1.30, effect: "+referral efficiency",    unlockLevel: 14 },
];

/** Upgrade maliyetini hesaplar */
export function calcUpgradeCost(upgrade: Upgrade, currentLevel: number): number {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costCurve, currentLevel));
}

/** Level'a göre açık upgrade'leri döner */
export function getAvailableUpgrades(playerLevel: number): Upgrade[] {
  return upgradeCatalog.filter((u) => u.unlockLevel <= playerLevel);
}
