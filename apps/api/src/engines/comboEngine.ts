/**
 * ADN Phase 2 — Combo Engine
 * Sunucu tarafı combo state hesaplama.
 * Frontend'deki useComboEngine ile paralel çalışır.
 */
export type ComboState = {
  combo: number;
  multiplier: number;
  lastTapAt: number;
};

export function createComboState(): ComboState {
  return { combo: 0, multiplier: 1, lastTapAt: 0 };
}

export function registerTap(state: ComboState, now = Date.now()): ComboState {
  const withinWindow = now - state.lastTapAt <= 2400;
  const combo = withinWindow ? state.combo + 1 : 1;

  let multiplier = 1;
  if      (combo >= 50) multiplier = 2.2;
  else if (combo >= 30) multiplier = 1.8;
  else if (combo >= 15) multiplier = 1.4;
  else if (combo >= 5)  multiplier = 1.15;

  return { combo, multiplier, lastTapAt: now };
}

/** Combo'dan multiplier hesapla (sadece count ile) */
export function comboMultiplierFor(combo: number): number {
  if (combo >= 50) return 2.2;
  if (combo >= 30) return 1.8;
  if (combo >= 15) return 1.4;
  if (combo >= 5)  return 1.15;
  return 1;
}
