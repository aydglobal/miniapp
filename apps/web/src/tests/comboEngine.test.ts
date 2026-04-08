import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { COMBO_TIMEOUT_MS, getMultiplier, getNextComboCount } from '../hooks/useComboEngine';

describe('getMultiplier', () => {
  it('returns expected threshold values', () => {
    expect(getMultiplier(0)).toBe(1.0);
    expect(getMultiplier(5)).toBe(1.5);
    expect(getMultiplier(10)).toBe(2.0);
    expect(getMultiplier(20)).toBe(3.0);
  });

  it('is monotonic for combo counts from 1 to 100', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (count) => {
        return getMultiplier(count) >= getMultiplier(count - 1);
      }),
      { numRuns: 100 }
    );
  });
});

describe('getNextComboCount', () => {
  it('increments within the combo window and resets to a fresh combo outside it', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: COMBO_TIMEOUT_MS * 2 }),
        fc.integer({ min: 1, max: 50 }),
        (intervalMs, initialCount) => {
          const nextCount = getNextComboCount(initialCount, intervalMs);
          return intervalMs < COMBO_TIMEOUT_MS ? nextCount === initialCount + 1 : nextCount === 1;
        }
      ),
      { numRuns: 100 }
    );
  });
});
