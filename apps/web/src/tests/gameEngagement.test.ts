import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import {
  getEnergyVariant,
  isStreakHighlighted,
  isStreakMilestone,
  shouldShowLevelUp
} from '../lib/gameEngagement';

describe('getEnergyVariant', () => {
  it('returns expected unit cases', () => {
    expect(getEnergyVariant(100)).toBe('full');
    expect(getEnergyVariant(19)).toBe('danger');
    expect(getEnergyVariant(50)).toBe('normal');
  });

  it('classifies energy percentages consistently', () => {
    fc.assert(
      fc.property(fc.float({ min: 0, max: 100, noNaN: true }), (percent) => {
        const variant = getEnergyVariant(percent);
        if (percent >= 100) return variant === 'full';
        if (percent < 20) return variant === 'danger';
        return variant === 'normal';
      }),
      { numRuns: 100 }
    );
  });
});

describe('streak helpers', () => {
  it('returns expected unit cases', () => {
    expect(isStreakHighlighted(6)).toBe(false);
    expect(isStreakHighlighted(7)).toBe(true);
    expect(isStreakMilestone(7)).toBe(true);
    expect(isStreakMilestone(8)).toBe(false);
  });

  it('keeps highlight and milestone thresholds consistent', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 365 }), (streak) => {
        const highlighted = isStreakHighlighted(streak);
        const milestone = isStreakMilestone(streak);
        return highlighted === (streak >= 7) && milestone === (streak > 0 && streak % 7 === 0);
      }),
      { numRuns: 100 }
    );
  });
});

describe('shouldShowLevelUp', () => {
  it('shows overlay only when the next level is higher', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 99 }),
        fc.integer({ min: 1, max: 100 }),
        (previousLevel, nextLevel) => {
          return shouldShowLevelUp(previousLevel, nextLevel) === (nextLevel > previousLevel);
        }
      ),
      { numRuns: 100 }
    );
  });
});
