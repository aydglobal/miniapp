import { BOOSTS, type BoostKey } from '../config/boosts';

type ActiveBoost = {
  type: BoostKey;
  level: number;
  isActive?: boolean;
  expiresAt: Date | null;
};

export function getActiveBoostMap(boosts: ActiveBoost[]) {
  const now = Date.now();
  const active = boosts.filter((boost) => {
    if (boost.isActive === false) return false;
    if (!boost.expiresAt) return false;
    return new Date(boost.expiresAt).getTime() > now;
  });

  let tapMultiplier = 1;
  let energyMaxBonus = 0;
  let regenMultiplier = 1;

  for (const boost of active) {
    if (boost.type === 'tap_x2') {
      tapMultiplier *= Math.pow(BOOSTS.tap_x2.value, boost.level);
    }

    if (boost.type === 'energy_cap') {
      energyMaxBonus += BOOSTS.energy_cap.value * boost.level;
    }

    if (boost.type === 'regen_x2') {
      regenMultiplier *= Math.pow(BOOSTS.regen_x2.value, boost.level);
    }
  }

  return {
    tapMultiplier,
    energyMaxBonus,
    regenMultiplier,
    active
  };
}

export function getEffectiveEnergyMax(baseEnergyMax: number, energyMaxBonus: number) {
  return baseEnergyMax + energyMaxBonus;
}

export function isBoostCurrentlyActive(boost: { isActive: boolean; expiresAt: Date | null }) {
  return boost.isActive && Boolean(boost.expiresAt && boost.expiresAt.getTime() > Date.now());
}
