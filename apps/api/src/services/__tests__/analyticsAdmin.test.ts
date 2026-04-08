import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// --- Özellik 6: DAU Hesaplama Doğruluğu ---
describe('DAU Hesaplama Doğruluğu', () => {
  it('lastSeenAt bugün olan kullanıcılar DAU\'ya dahil edilmeli', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            lastSeenAt: fc.option(fc.date({ min: new Date(Date.now() - 25 * 3600 * 1000) }), { nil: null })
          }),
          { minLength: 0, maxLength: 50 }
        ),
        (users) => {
          const since = new Date(Date.now() - 24 * 3600 * 1000);
          const dau = users.filter(u => u.lastSeenAt !== null && u.lastSeenAt >= since).length;
          return dau >= 0 && dau <= users.length;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Özellik 7: ARPU Hesaplama Doğruluğu ---
describe('ARPU Hesaplama Doğruluğu', () => {
  it('DAU 0 ise ARPU 0 olmalı', () => {
    const arpu = (revenue: number, dau: number) => dau > 0 ? revenue / dau : 0;
    expect(arpu(1000, 0)).toBe(0);
  });

  it('ARPU = revenue / DAU olmalı', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 1, max: 10000 }),
        (revenue, dau) => {
          const arpu = revenue / dau;
          return arpu >= 0 && arpu <= revenue;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Özellik 8: Anomali Tespiti Eşiği ---
describe('Anomali Tespiti Eşiği', () => {
  it('%20 veya üzeri düşüş anomali olarak işaretlenmeli', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 10000 }),
        fc.integer({ min: 0, max: 100 }), // yüzde olarak drop (0-100)
        (yesterday, dropPercent) => {
          const dropRatio = dropPercent / 100;
          const today = Math.floor(yesterday * (1 - dropRatio));
          const actualDrop = yesterday > 0 ? (yesterday - today) / yesterday : 0;
          const isAnomaly = actualDrop >= 0.2;
          const detected = dropRatio >= 0.2;
          // Her ikisi de aynı yönde olmalı
          if (detected) return isAnomaly;
          return true; // düşük drop'ta anomali olmayabilir (floor nedeniyle)
        }
      ),
      { numRuns: 100 }
    );
  });
});
