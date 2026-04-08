# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - initData Zaman Aşımı ve API Bot Polling
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate both bugs exist
  - **Scoped PBT Approach**: Scope to concrete failing cases — valid HMAC hash with auth_date age in 300–3600s range, and presence of startTelegramBot call in index.ts
  - Test 1: Generate valid initData with auth_date = now - 360 (6 min ago), call verifyTelegramInitData with unfixed default (maxAgeSeconds=300) → assert returns true (WILL FAIL on unfixed code, returns false)
  - Test 2: Generate valid initData with auth_date = now - 1800 (30 min ago) → assert returns true (WILL FAIL on unfixed code)
  - Test 3: Generate valid initData with auth_date = now - 3540 (59 min ago) → assert returns true (WILL FAIL on unfixed code)
  - Test 4: Assert that apps/api/src/index.ts does NOT call startTelegramBot() (WILL FAIL on unfixed code — call exists)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves both bugs exist)
  - Document counterexamples found: e.g. "verifyTelegramInitData returns false for ageSeconds=360 despite valid hash" and "startTelegramBot() call found in index.ts"
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Replay Attack Koruması ve Bağımsız Bot Davranışı
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: verifyTelegramInitData(initData_with_age_240, botToken) returns true on unfixed code (age < 300, already works)
  - Observe: verifyTelegramInitData(initData_with_age_7200, botToken) returns false on unfixed code (replay attack, age > 3600)
  - Observe: verifyTelegramInitData(initData_with_invalid_hash, botToken) returns false on unfixed code (bad hash)
  - Observe: verifyTelegramInitData(initData_missing_hash, botToken) returns false on unfixed code (missing hash)
  - Write property-based test: for all initData where ageSeconds > 3600 AND hash is valid → result must be false (replay attack protection preserved)
  - Write property-based test: for all initData where hash is invalid or missing → result must be false (hash validation preserved)
  - Write property-based test: for all initData where ageSeconds <= 300 AND hash is valid → result must be true (short-age path preserved)
  - Verify all tests PASS on UNFIXED code (these are non-bug-condition cases)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix for initData zaman aşımı ve çift bot polling çakışması

  - [x] 3.1 Implement Fix 1: maxAgeSeconds varsayılan değerini 300'den 3600'e güncelle
    - In `apps/api/src/lib/telegram.ts`, update function signature: `maxAgeSeconds = 300` → `maxAgeSeconds = 3600`
    - Single-line change in the `verifyTelegramInitData` function signature
    - All call sites that do not override the parameter will automatically use the new value
    - _Bug_Condition: isBugCondition_1(initData, botToken) where hash is valid AND 300 < ageSeconds <= 3600_
    - _Expected_Behavior: verifyTelegramInitData returns true for valid hash with ageSeconds in [0, 3600]_
    - _Preservation: ageSeconds > 3600 still returns false; invalid/missing hash still returns false_
    - _Requirements: 2.1, 3.1, 3.2_

  - [x] 3.2 Implement Fix 2: API sunucusundan startTelegramBot() çağrısını kaldır
    - In `apps/api/src/index.ts`, remove the line: `startTelegramBot().catch((err) => logger.error({ err }, 'telegram_bot_error'));`
    - Remove the import: `import { startTelegramBot } from './lib/telegram'` (or keep if other exports from telegram.ts are still used — check usages first)
    - Bot polling management is solely the responsibility of `apps/bot/src/index.ts`
    - _Bug_Condition: isBugCondition_2(env) where BOT_TOKEN is defined AND apiServerRunning=true AND startTelegramBot is called_
    - _Expected_Behavior: API server starts without initiating any Telegram bot polling_
    - _Preservation: apps/bot continues to operate independently in webhook or polling mode_
    - _Requirements: 2.2, 3.4, 3.5_

  - [x] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - initData Zaman Aşımı Toleransı ve Bot Polling Yok
    - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - When these tests pass, it confirms both bugs are fixed
    - Run bug condition exploration tests from step 1
    - **EXPECTED OUTCOME**: Tests PASS (confirms both bugs are fixed)
    - _Requirements: 2.1, 2.2_

  - [x] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Replay Attack Koruması ve Bağımsız Bot Davranışı
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm replay attack protection (ageSeconds > 3600 → false) is intact
    - Confirm invalid/missing hash still returns false
    - Confirm apps/bot behavior is unaffected

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
