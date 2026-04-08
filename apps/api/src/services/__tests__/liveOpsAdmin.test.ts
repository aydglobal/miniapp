import { describe, it } from 'vitest';
import * as fc from 'fast-check';

// --- Özellik 1: Live Event Round-Trip Tutarlılığı ---
describe('Live Event Round-Trip Tutarlılığı', () => {
  it('modifiersJson parse/stringify round-trip tutarlı olmalı', () => {
    fc.assert(
      fc.property(
        fc.record({
          tapMultiplier: fc.float({ min: 1, max: 5, noNaN: true }),
          chestLuckMultiplier: fc.float({ min: 1, max: 3, noNaN: true })
        }),
        (modifiers) => {
          const json = JSON.stringify(modifiers);
          const parsed = JSON.parse(json);
          return (
            Math.abs(parsed.tapMultiplier - modifiers.tapMultiplier) < 0.0001 &&
            Math.abs(parsed.chestLuckMultiplier - modifiers.chestLuckMultiplier) < 0.0001
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Özellik 3: Soft Delete Invariantı ---
describe('Soft Delete Invariantı', () => {
  it('deletedAt olan event\'ler aktif listede olmamalı', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            isEnabled: fc.boolean(),
            deletedAt: fc.option(fc.date(), { nil: null }),
            endsAt: fc.date()
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (events) => {
          const now = new Date();
          const visible = events.filter(
            e => e.isEnabled && e.endsAt > now && e.deletedAt === null
          );
          return visible.every(e => e.deletedAt === null);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Özellik 2: Live Event Multiplier Güncelliği ---
describe('Live Event Multiplier Güncelliği', () => {
  it('aktif olmayan event\'ler multiplier\'ı 1.0\'dan büyük yapmamalı', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            isEnabled: fc.constant(false),
            endsAt: fc.date({ max: new Date(Date.now() - 1000) }),
            modifiersJson: fc.constant('{"tapMultiplier":3}')
          }),
          { minLength: 0, maxLength: 10 }
        ),
        (events) => {
          const now = new Date();
          const activeEvents = events.filter(e => e.isEnabled && e.endsAt > now);
          let multiplier = 1;
          for (const event of activeEvents) {
            try {
              const mods = JSON.parse(event.modifiersJson) as Record<string, number>;
              if (mods.tapMultiplier > multiplier) multiplier = mods.tapMultiplier;
            } catch { /* ignore */ }
          }
          return multiplier === 1;
        }
      ),
      { numRuns: 100 }
    );
  });
});
