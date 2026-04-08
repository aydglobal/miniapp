/**
 * ADN Phase 2 — Core Loop Economy Config
 * Merkezi ekonomi sabitleri. Tüm engine'ler buradan okur.
 */
export const economyConfig = {
  // Tap
  baseTap: 1,
  critChance: 0.08,
  critMultiplier: 5,
  comboWindowMs: 2400,

  // Passive
  passiveUnlockLevel: 3,

  // Chest
  chestDropChance: 0.045,

  // Prestige
  prestigeUnlockLevel: 18,

  // Missions
  missionRefreshHours: 12,

  // Referral
  referralSoftCap: 30,

  // Offline
  offlineCapHours: 8,

  // Anti-whale
  antiWhaleSoftFriction: true,
} as const;

export type EconomyConfig = typeof economyConfig;
