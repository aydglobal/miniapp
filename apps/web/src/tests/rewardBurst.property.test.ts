import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { addBurstWithLimit, type RewardBurstLike } from '../lib/gameEngagement';

type RewardBurst = RewardBurstLike;

function makeBurst(i: number): RewardBurst {
  return { id: i, label: `+${i}`, x: i * 10, y: i * 5, tone: 'gold' };
}

describe('addBurstWithLimit', () => {
  it('adds a burst to an empty list', () => {
    const result = addBurstWithLimit([], makeBurst(0));
    expect(result).toHaveLength(1);
  });

  it('caps the list at 8 when a 9th item is added', () => {
    let bursts: RewardBurst[] = [];
    for (let i = 0; i < 9; i += 1) bursts = addBurstWithLimit(bursts, makeBurst(i));
    expect(bursts).toHaveLength(8);
    expect(bursts.find((burst) => burst.id === 0)).toBeUndefined();
    expect(bursts.at(-1)?.id).toBe(8);
  });

  it('keeps reward burst length at 8 or below for any 1-50 insertions', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (burstCount) => {
        let bursts: RewardBurst[] = [];
        for (let i = 0; i < burstCount; i += 1) {
          bursts = addBurstWithLimit(bursts, makeBurst(i));
        }
        return bursts.length <= 8;
      }),
      { numRuns: 100 }
    );
  });
});
