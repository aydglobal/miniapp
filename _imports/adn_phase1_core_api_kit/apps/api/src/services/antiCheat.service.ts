import { prisma } from "../lib/prisma";

type TapOptions = { nonce?: string };

export async function assertTapAllowed(userId: string, options: TapOptions) {
  const signal = await prisma.tapSignal.findUnique({ where: { userId } });

  if (!signal) return;
  if (signal.lockedUntil && signal.lockedUntil > new Date()) {
    throw new Error("Temporarily locked");
  }

  const now = Date.now();
  const lastTapAt = signal.lastTapAt?.getTime() ?? 0;
  const delta = now - lastTapAt;

  if (delta < 250) {
    await prisma.tapSignal.update({
      where: { userId },
      data: {
        suspiciousScore: { increment: 1 },
      },
    });
    throw new Error("Too many taps");
  }

  if (options.nonce && options.nonce === signal.lastNonce) {
    throw new Error("Duplicate nonce");
  }
}

export async function registerTapSignal(userId: string) {
  const now = new Date();
  await prisma.tapSignal.upsert({
    where: { userId },
    create: { userId, lastTapAt: now },
    update: { lastTapAt: now },
  });
}
