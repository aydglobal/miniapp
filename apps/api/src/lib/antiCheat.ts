import crypto from 'crypto';

export class AntiCheatError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 429) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function generateTapNonce(): number {
  return crypto.randomInt(0, 2_147_483_647);
}

export function assertTapAllowed(user: {
  isTapLockedUntil: Date | null;
  lastTapAt: Date | null;
  tapWindowStart: Date | null;
  tapsInWindow: number;
  tapNonce: number;
}, body: { count?: number; clientNonce?: number }) {
  const now = Date.now();
  const tapCount = Math.max(1, Math.min(50, Math.floor(body.count || 1)));

  if (user.isTapLockedUntil && user.isTapLockedUntil.getTime() > now) {
    throw new AntiCheatError('Tap temporarily locked');
  }

  if (body.clientNonce != null && body.clientNonce !== user.tapNonce) {
    throw new AntiCheatError('Invalid tap nonce', 400);
  }

  if (user.lastTapAt && now - user.lastTapAt.getTime() < 100) {
    throw new AntiCheatError('Too many taps too quickly');
  }

  const windowStart = user.tapWindowStart?.getTime() || now;
  const windowAgeMs = now - windowStart;
  const nextWindowCount = windowAgeMs > 10_000 ? tapCount : user.tapsInWindow + tapCount;
  if (nextWindowCount > 120) {
    throw new AntiCheatError('Tap rate exceeded');
  }

  return {
    tapCount,
    nextWindowCount,
    resetWindow: windowAgeMs > 10_000
  };
}
