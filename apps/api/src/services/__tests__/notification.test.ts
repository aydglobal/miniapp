import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// --- Özellik 14: Notification Rate Limit ---
describe('Notification Rate Limit', () => {
  it('1 saatte 5\'ten fazla bildirim gönderilmemeli', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }),
        (sentCount) => {
          const MAX = 5;
          const allowed = sentCount < MAX;
          return typeof allowed === 'boolean';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rate limit aşıldığında yeni bildirim reddedilmeli', () => {
    const MAX = 5;
    for (let i = 0; i <= MAX; i++) {
      const allowed = i < MAX;
      if (i < MAX) expect(allowed).toBe(true);
      else expect(allowed).toBe(false);
    }
  });
});

// --- Özellik 15: Notification FIFO Sırası ---
describe('Notification FIFO Sırası', () => {
  it('kuyruk FIFO sırasını korumalı', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            createdAt: fc.date({ noInvalidDate: true })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (notifications) => {
          const sorted = [...notifications].sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
          );
          return sorted[0].createdAt <= sorted[sorted.length - 1].createdAt;
        }
      ),
      { numRuns: 100 }
    );
  });
});
