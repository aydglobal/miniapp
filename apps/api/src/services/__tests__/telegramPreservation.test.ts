/**
 * Preservation Property Tests — Telegram API Error Fix
 *
 * Bu testler UNFIXED kod üzerinde PASS etmeli.
 * Değişmemesi gereken davranışları doğrular (regression koruması).
 * Fix uygulandıktan sonra da PASS etmeye devam etmeli.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import crypto from 'crypto';
import { verifyTelegramInitData } from '../../lib/telegram';

// ── Yardımcı: Gerçek HMAC-SHA256 hash ile geçerli initData üret ──────────────
function buildValidInitData(authDateUnix: number, botToken: string): string {
  const params = new URLSearchParams();
  params.set('auth_date', String(authDateUnix));
  params.set('user', JSON.stringify({ id: 123456789, first_name: 'Test' }));
  params.set('query_id', 'AAHdF6IQAAAAAN0XohDhrOrc');

  // data_check_string: hash hariç, key sıralı, \n ile birleştirilmiş
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  params.set('hash', hash);
  return params.toString();
}

const FAKE_BOT_TOKEN = 'test_bot_token_12345';
const nowUnix = () => Math.floor(Date.now() / 1000);

// ── Gözlemler: Unfixed kodda mevcut davranışı doğrula ────────────────────────
describe('Observations — Unfixed Kod Davranışı', () => {
  it('Observe 1: age=240 (< 300) → true (zaten çalışıyor)', () => {
    const authDate = nowUnix() - 240;
    const initData = buildValidInitData(authDate, FAKE_BOT_TOKEN);
    expect(verifyTelegramInitData(initData, FAKE_BOT_TOKEN)).toBe(true);
  });

  it('Observe 2: age=7200 (> 3600) → false (replay attack koruması)', () => {
    const authDate = nowUnix() - 7200;
    const initData = buildValidInitData(authDate, FAKE_BOT_TOKEN);
    expect(verifyTelegramInitData(initData, FAKE_BOT_TOKEN)).toBe(false);
  });

  it('Observe 3: geçersiz hash → false (hash doğrulaması)', () => {
    const authDate = nowUnix() - 60;
    const params = new URLSearchParams();
    params.set('auth_date', String(authDate));
    params.set('user', JSON.stringify({ id: 123456789, first_name: 'Test' }));
    params.set('hash', 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef');
    expect(verifyTelegramInitData(params.toString(), FAKE_BOT_TOKEN)).toBe(false);
  });

  it('Observe 4: hash eksik → false (eksik hash)', () => {
    const authDate = nowUnix() - 60;
    const params = new URLSearchParams();
    params.set('auth_date', String(authDate));
    params.set('user', JSON.stringify({ id: 123456789, first_name: 'Test' }));
    // hash parametresi yok
    expect(verifyTelegramInitData(params.toString(), FAKE_BOT_TOKEN)).toBe(false);
  });
});

// ── Property 1: Replay Attack Koruması ───────────────────────────────────────
describe('Property 1: Replay Attack Koruması (ageSeconds > 3600 → false)', () => {
  /**
   * For all initData where ageSeconds > 3600 AND hash is valid
   * → result must be false (replay attack protection preserved)
   *
   * Validates: Requirements 3.1, 3.2
   */
  it('PBT: geçerli hash ile ageSeconds > 3600 → her zaman false', () => {
    fc.assert(
      fc.property(
        // 3601 ile 86400 (1 gün) arasında rastgele age
        fc.integer({ min: 3601, max: 86400 }),
        (ageSeconds) => {
          const authDate = nowUnix() - ageSeconds;
          const initData = buildValidInitData(authDate, FAKE_BOT_TOKEN);
          const result = verifyTelegramInitData(initData, FAKE_BOT_TOKEN);
          return result === false;
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ── Property 2: Hash Doğrulama Koruması ──────────────────────────────────────
describe('Property 2: Hash Doğrulama Koruması (geçersiz/eksik hash → false)', () => {
  /**
   * For all initData where hash is invalid or missing
   * → result must be false (hash validation preserved)
   *
   * Validates: Requirements 3.2
   */
  it('PBT: geçersiz hash (64 hex char ama yanlış) → her zaman false', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3600 }),
        // 64 hex karakterden oluşan ama gerçek hash olmayan string
        fc.stringMatching(/^[0-9a-f]{64}$/),
        (ageSeconds, fakeHash) => {
          const authDate = nowUnix() - ageSeconds;
          const params = new URLSearchParams();
          params.set('auth_date', String(authDate));
          params.set('user', JSON.stringify({ id: 123456789, first_name: 'Test' }));
          params.set('query_id', 'AAHdF6IQAAAAAN0XohDhrOrc');
          params.set('hash', fakeHash);

          const result = verifyTelegramInitData(params.toString(), FAKE_BOT_TOKEN);
          return result === false;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('PBT: hash parametresi tamamen eksik → her zaman false', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3600 }),
        (ageSeconds) => {
          const authDate = nowUnix() - ageSeconds;
          const params = new URLSearchParams();
          params.set('auth_date', String(authDate));
          params.set('user', JSON.stringify({ id: 123456789, first_name: 'Test' }));
          // hash yok

          const result = verifyTelegramInitData(params.toString(), FAKE_BOT_TOKEN);
          return result === false;
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ── Property 3: Kısa Süre Yolu Koruması ──────────────────────────────────────
describe('Property 3: Kısa Süre Yolu Koruması (ageSeconds <= 300 AND hash valid → true)', () => {
  /**
   * For all initData where ageSeconds <= 300 AND hash is valid
   * → result must be true (short-age path preserved)
   *
   * Validates: Requirements 3.1
   */
  it('PBT: geçerli hash ile ageSeconds <= 300 → her zaman true', () => {
    fc.assert(
      fc.property(
        // 0 ile 299 arasında rastgele age (300 dahil değil — sınır değeri)
        fc.integer({ min: 0, max: 299 }),
        (ageSeconds) => {
          const authDate = nowUnix() - ageSeconds;
          const initData = buildValidInitData(authDate, FAKE_BOT_TOKEN);
          const result = verifyTelegramInitData(initData, FAKE_BOT_TOKEN);
          return result === true;
        }
      ),
      { numRuns: 50 }
    );
  });
});
