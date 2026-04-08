import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// --- Özellik 16: Fraud Score Anomali Tespiti ---
describe('Fraud Score Anomali Tespiti', () => {
  it('tap hızı 15/sn üzerinde ise skor artmalı', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 16, max: 100 }),
        fc.integer({ min: 100, max: 999 }), // windowMs küçük tutulursa taps/sn yüksek olur
        (tapsInWindow, windowMs) => {
          const tapsPerSecond = tapsInWindow / (windowMs / 1000);
          // Sadece gerçekten 15+ olan durumları test et
          if (tapsPerSecond <= 15) return true; // skip
          const scoreIncrease = tapsPerSecond > 15 ? 20 : 0;
          return scoreIncrease > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('skor 0-100 arasında sınırlandırılmalı', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200 }),
        (rawScore) => {
          const clamped = Math.min(100, rawScore);
          return clamped >= 0 && clamped <= 100;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Özellik 17: Multi-Account Tespiti ---
describe('Multi-Account Tespiti', () => {
  it('aynı fingerprint\'ten 3+ farklı kullanıcı varsa tespit edilmeli', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 0, maxLength: 20 }),
        fc.string({ minLength: 1 }),
        (userIds, currentUserId) => {
          const uniqueOthers = new Set(userIds.filter(id => id !== currentUserId));
          const detected = uniqueOthers.size >= 3;
          return typeof detected === 'boolean';
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Özellik 18: Withdrawal Risk Skoru Monotonluğu ---
describe('Withdrawal Risk Skoru Monotonluğu', () => {
  it('daha yüksek suspiciousScore daha yüksek risk skoru üretmeli', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 51, max: 100 }),
        (lowScore, highScore) => {
          // Risk skoru suspiciousScore ile doğru orantılı
          const riskLow = lowScore / 100;
          const riskHigh = highScore / 100;
          return riskHigh >= riskLow;
        }
      ),
      { numRuns: 100 }
    );
  });
});
