export type EnergyBarVariant = 'normal' | 'full' | 'danger';

export type RewardBurstTone = 'gold' | 'cyan' | 'pink' | 'violet';

export type RewardBurstLike = {
  id: number;
  label: string;
  x: number;
  y: number;
  tone: RewardBurstTone;
};

export function getEnergyVariant(percent: number): EnergyBarVariant {
  if (percent >= 100) return 'full';
  if (percent < 20) return 'danger';
  return 'normal';
}

export function isStreakHighlighted(streak: number): boolean {
  return streak >= 7;
}

export function isStreakMilestone(streak: number): boolean {
  return streak > 0 && streak % 7 === 0;
}

export function shouldShowLevelUp(prevLevel: number, nextLevel: number): boolean {
  return nextLevel > prevLevel;
}

export function addBurstWithLimit<T>(bursts: T[], burst: T, limit = 8): T[] {
  const next = [...bursts, burst];
  return next.length > limit ? next.slice(next.length - limit) : next;
}

export function buildStreakHistory(streak: number, days = 7): boolean[] {
  return Array.from({ length: days }, (_, index) => days - index <= Math.min(streak, days));
}
