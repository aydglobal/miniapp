/**
 * ADN Phase 2 — Prestige Engine
 * Prestige puan hesaplama ve buff'ları.
 */

/**
 * Prestige puanı hesapla.
 * totalLifetimeEarned: tüm zamanların toplam kazancı
 * highestLevel: ulaşılan en yüksek level
 */
export function prestigePointsFor(totalLifetimeEarned: number, highestLevel: number): number {
  const base = Math.sqrt(Math.max(0, totalLifetimeEarned) / 10000);
  const levelBonus = Math.max(0, highestLevel - 15) * 0.35;
  return Math.floor(base + levelBonus);
}

/**
 * Prestige puanından buff'ları hesapla.
 */
export function prestigeBuff(points: number) {
  return {
    globalEarnMultiplier: 1 + points * 0.04,
    chestLuck: Math.min(0.25, points * 0.006),
    startCoins: points * 100,
  };
}

/**
 * Prestige yapılabilir mi?
 */
export function canPrestige(params: {
  level: number;
  totalLifetimeEarned: number;
  prestigeUnlockLevel?: number;
}): boolean {
  const minLevel = params.prestigeUnlockLevel ?? 18;
  return params.level >= minLevel && params.totalLifetimeEarned >= 50000;
}
