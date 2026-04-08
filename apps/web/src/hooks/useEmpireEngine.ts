/**
 * ADN Crypto Empire Pro Pack — Game Engine Hook
 * Tap power, combo, crit, passive income ve prestige hesaplamalarını sağlar.
 */

export type EmpireStats = {
  tapBase: number;
  comboMultiplier: number;
  critChance: number;
  critMultiplier: number;
  passivePerSecond: number;
  tradeDeskBoost: number;
  chestRewardBoost: number;
};

interface EmpireEngineInput {
  level: number;
  prestige: number;
  tapPowerLevel: number;
  comboMasteryLevel: number;
  critEngineLevel: number;
  autoMinerLevel: number;
  tradeDeskLevel: number;
  quantumRigLevel: number;
  vipVaultLevel: number;
  combo: number;
  eventTapBoost?: number;
  eventPassiveBoost?: number;
  eventChestBoost?: number;
}

export function calcEmpireStats(input: EmpireEngineInput): EmpireStats {
  const {
    level,
    prestige,
    tapPowerLevel,
    comboMasteryLevel,
    critEngineLevel,
    autoMinerLevel,
    tradeDeskLevel,
    quantumRigLevel,
    vipVaultLevel,
    combo,
    eventTapBoost = 1,
    eventPassiveBoost = 1,
    eventChestBoost = 1,
  } = input;

  const tradeDeskBoost = 1 + tradeDeskLevel * 0.18 + prestige * 0.25;
  const tapBase = 1 + tapPowerLevel * 1.3 + level * 0.35;
  const comboMultiplier = 1 + combo * (0.12 + comboMasteryLevel * 0.01);
  const critChance = Math.min(0.12 + critEngineLevel * 0.012, 0.48);
  const critMultiplier = 3 + critEngineLevel * 0.22;
  const passivePerSecond =
    (autoMinerLevel * 2.6 + vipVaultLevel * 4) * tradeDeskBoost * eventPassiveBoost;
  const chestRewardBoost =
    (1 + quantumRigLevel * 0.18 + prestige * 0.1) * eventChestBoost;

  return {
    tapBase: tapBase * tradeDeskBoost * eventTapBoost,
    comboMultiplier,
    critChance,
    critMultiplier,
    passivePerSecond,
    tradeDeskBoost,
    chestRewardBoost,
  };
}

export const UPGRADE_SCALING: Record<string, { baseCost: number; scaling: number; cap: number }> = {
  tapPower:      { baseCost: 25,    scaling: 1.55, cap: 80 },
  comboMastery:  { baseCost: 120,   scaling: 1.72, cap: 40 },
  critEngine:    { baseCost: 300,   scaling: 1.85, cap: 30 },
  autoMiner:     { baseCost: 500,   scaling: 1.9,  cap: 50 },
  tradeDesk:     { baseCost: 1500,  scaling: 2.05, cap: 25 },
  quantumRig:    { baseCost: 7500,  scaling: 2.2,  cap: 20 },
  vipVault:      { baseCost: 25000, scaling: 2.35, cap: 10 },
};

export function getUpgradeCost(key: string, currentLevel: number): number {
  const def = UPGRADE_SCALING[key];
  if (!def) return 0;
  return Math.floor(def.baseCost * Math.pow(def.scaling, currentLevel));
}
