export type BoostKey = 'tap_x2' | 'energy_cap' | 'regen_x2' | 'tap_x5' | 'combo_lock' | 'crit_boost' | 'vip_weekly' | 'event_pass';

type BoostConfig = {
  name: string;
  description: string;
  basePrice: number;
  durationHours: number;
  value: number;
  maxLevel: number;
  freeClaimCooldownHours?: number;
  premiumStarsPrice?: number;
  category: 'speed' | 'energy' | 'vip' | 'event';
  badge?: string;
};

export const BOOSTS: Record<BoostKey, BoostConfig> = {
  tap_x2: {
    name: '⚡ 2x Tap Boost',
    description: '5 dakika boyunca her tap 2x coin üretir.',
    basePrice: 500,
    durationHours: 0.083, // 5 dk
    value: 2,
    maxLevel: 5,
    freeClaimCooldownHours: 24,
    premiumStarsPrice: 25,
    category: 'speed',
    badge: 'HOT'
  },
  tap_x5: {
    name: '🚀 5x Tap Boost',
    description: '3 dakika boyunca her tap 5x coin üretir.',
    basePrice: 1200,
    durationHours: 0.05, // 3 dk
    value: 5,
    maxLevel: 3,
    premiumStarsPrice: 50,
    category: 'speed',
    badge: 'POWER'
  },
  combo_lock: {
    name: '🔥 Combo Stabilizer',
    description: 'Combo çarpanı 1 saat boyunca düşmez.',
    basePrice: 800,
    durationHours: 1,
    value: 1,
    maxLevel: 3,
    premiumStarsPrice: 35,
    category: 'speed',
    badge: 'NEW'
  },
  crit_boost: {
    name: '🎯 Crit Chance +%25',
    description: '30 dakika boyunca kritik vuruş şansı %25 artar.',
    basePrice: 900,
    durationHours: 0.5,
    value: 25,
    maxLevel: 3,
    premiumStarsPrice: 40,
    category: 'speed'
  },
  energy_cap: {
    name: '🔋 +500 Max Energy',
    description: '24 saat boyunca maksimum enerji +500 artar.',
    basePrice: 700,
    durationHours: 24,
    value: 500,
    maxLevel: 5,
    premiumStarsPrice: 35,
    category: 'energy'
  },
  regen_x2: {
    name: '⚡ 2x Enerji Regen',
    description: '24 saat boyunca enerji 2x hızlı yenilenir.',
    basePrice: 600,
    durationHours: 24,
    value: 2,
    maxLevel: 5,
    premiumStarsPrice: 30,
    category: 'energy'
  },
  vip_weekly: {
    name: '👑 VIP Haftalık',
    description: '7 gün: +%20 coin, özel görevler, günlük enerji dolumu.',
    basePrice: 5000,
    durationHours: 168, // 7 gün
    value: 20,
    maxLevel: 1,
    premiumStarsPrice: 150,
    category: 'vip',
    badge: 'VIP'
  },
  event_pass: {
    name: '🔥 Event Pass',
    description: 'Aktif event süresince 2x bonus + özel event chest.',
    basePrice: 2000,
    durationHours: 24,
    value: 2,
    maxLevel: 1,
    premiumStarsPrice: 75,
    category: 'event',
    badge: 'LIMITED'
  }
};

export function getBoostPrice(type: BoostKey, currentLevel: number) {
  const cfg = BOOSTS[type];
  return cfg.basePrice + currentLevel * Math.floor(cfg.basePrice * 0.4);
}
