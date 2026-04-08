/**
 * Bug Condition Exploration Tests — Telegram API Error Fix
 *
 * Bu testler UNFIXED kod üzerinde FAIL etmesi bekleniyor.
 * FAIL = bug'ın varlığının kanıtı (SUCCESS case).
 *
 * Validates: Requirements 1.1, 1.2
 */

import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
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

// ── Bug 1: initData Zaman Aşımı ───────────────────────────────────────────────
describe('Bug Condition Exploration — initData Zaman Aşımı (Bug 1)', () => {
  /**
   * Test 1: auth_date = now - 360 (6 dakika önce)
   * Geçerli hash, ageSeconds=360 > 300 → unfixed kodda false döner (BUG)
   * Fix sonrası: 360 < 3600 olduğu için true dönmeli
   */
  it('Test 1: auth_date 6 dakika önce (360s) — geçerli hash ile true dönmeli', () => {
    const authDate = nowUnix() - 360;
    const initData = buildValidInitData(authDate, FAKE_BOT_TOKEN);

    // Unfixed kodda maxAgeSeconds=300 (default), 360 > 300 → false döner → test FAIL
    // Fix sonrası maxAgeSeconds=3600, 360 < 3600 → true döner → test PASS
    const result = verifyTelegramInitData(initData, FAKE_BOT_TOKEN);
    expect(result).toBe(true);
  });

  /**
   * Test 2: auth_date = now - 1800 (30 dakika önce)
   * Geçerli hash, ageSeconds=1800 > 300 → unfixed kodda false döner (BUG)
   */
  it('Test 2: auth_date 30 dakika önce (1800s) — geçerli hash ile true dönmeli', () => {
    const authDate = nowUnix() - 1800;
    const initData = buildValidInitData(authDate, FAKE_BOT_TOKEN);

    const result = verifyTelegramInitData(initData, FAKE_BOT_TOKEN);
    expect(result).toBe(true);
  });

  /**
   * Test 3: auth_date = now - 3540 (59 dakika önce)
   * Geçerli hash, ageSeconds=3540 > 300 → unfixed kodda false döner (BUG)
   */
  it('Test 3: auth_date 59 dakika önce (3540s) — geçerli hash ile true dönmeli', () => {
    const authDate = nowUnix() - 3540;
    const initData = buildValidInitData(authDate, FAKE_BOT_TOKEN);

    const result = verifyTelegramInitData(initData, FAKE_BOT_TOKEN);
    expect(result).toBe(true);
  });
});

// ── Bug 2: API Sunucusunda startTelegramBot() Çağrısı ────────────────────────
describe('Bug Condition Exploration — API Sunucusunda Bot Polling (Bug 2)', () => {
  /**
   * Test 4: apps/api/src/index.ts içinde startTelegramBot() çağrısı OLMAMALI
   * Unfixed kodda çağrı mevcut → test FAIL (BUG kanıtı)
   * Fix sonrası çağrı kaldırılmış → test PASS
   */
  it('Test 4: apps/api/src/index.ts startTelegramBot() çağırmamalı', () => {
    const indexPath = path.resolve(__dirname, '../../index.ts');
    const content = fs.readFileSync(indexPath, 'utf-8');

    // startTelegramBot() çağrısı (import değil, gerçek çağrı) olmamalı
    const hasCall = /startTelegramBot\s*\(\s*\)/.test(content);
    expect(hasCall).toBe(false);
  });
});
