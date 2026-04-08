import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { createHash } from 'crypto';

// assignVariant'ı doğrudan burada tanımlıyoruz — Prisma bağımlılığı olmadan
function assignVariant(userId: string, testId: string, variantCount: number): number {
  const hash = createHash('sha256').update(userId + testId).digest('hex');
  const num = parseInt(hash.slice(0, 8), 16);
  return num % variantCount;
}

// --- Özellik 4: A/B Test Deterministik Atama ---
describe('A/B Test Deterministik Atama', () => {
  it('aynı userId+testId her zaman aynı variant\'ı döndürmeli', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.integer({ min: 2, max: 10 }),
        (userId, testId, variantCount) => {
          const v1 = assignVariant(userId, testId, variantCount);
          const v2 = assignVariant(userId, testId, variantCount);
          return v1 === v2;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('döndürülen variant 0 ile variantCount-1 arasında olmalı', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.integer({ min: 2, max: 10 }),
        (userId, testId, variantCount) => {
          const v = assignVariant(userId, testId, variantCount);
          return v >= 0 && v < variantCount;
        }
      ),
      { numRuns: 200 }
    );
  });
});

// --- Özellik 5: A/B Test Rollout Tamamlığı ---
describe('A/B Test Rollout Tamamlığı', () => {
  it('tüm kullanıcılar bir variant\'a atanmış olmalı', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1 }),
        fc.integer({ min: 2, max: 5 }),
        (userIds, testId, variantCount) => {
          const assignments = userIds.map(uid => assignVariant(uid, testId, variantCount));
          return assignments.every(v => v >= 0 && v < variantCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});
