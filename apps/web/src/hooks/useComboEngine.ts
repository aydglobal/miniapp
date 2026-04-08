import { useCallback, useEffect, useRef, useState } from 'react';

export type ComboState = {
  comboCount: number;
  comboMultiplier: number;
  isActive: boolean;
};

export type UseComboEngineReturn = ComboState & {
  registerTap: () => void;
  reset: () => void;
};

export function getMultiplier(count: number): number {
  if (count >= 20) return 3.0;
  if (count >= 10) return 2.0;
  if (count >= 5) return 1.5;
  return 1.0;
}

export const COMBO_TIMEOUT_MS = 1200;

export function getNextComboCount(previousCount: number, elapsedMs: number): number {
  return elapsedMs < COMBO_TIMEOUT_MS ? Math.max(0, previousCount) + 1 : 1;
}

export function useComboEngine(): UseComboEngineReturn {
  const [comboCount, setComboCount] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapAtRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    lastTapAtRef.current = null;
    setComboCount(0);
  }, []);

  const registerTap = useCallback(() => {
    const now = Date.now();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setComboCount((prev) => {
      if (lastTapAtRef.current === null) {
        lastTapAtRef.current = now;
        return 1;
      }

      const elapsedMs = now - lastTapAtRef.current;
      lastTapAtRef.current = now;
      return getNextComboCount(prev, elapsedMs);
    });
    timeoutRef.current = setTimeout(() => {
      lastTapAtRef.current = null;
      setComboCount(0);
      timeoutRef.current = null;
    }, COMBO_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      lastTapAtRef.current = null;
    };
  }, []);

  const comboMultiplier = getMultiplier(comboCount);
  const isActive = comboCount >= 5;

  return { comboCount, comboMultiplier, isActive, registerTap, reset };
}
