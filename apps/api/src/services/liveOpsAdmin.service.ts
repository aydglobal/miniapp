import { prisma } from '../lib/prisma';

// ── Live event cache — her tap'ta DB'ye gitmesin ──────────────────────────────
let _eventCache: { data: any[]; expiresAt: number } | null = null;
const EVENT_CACHE_TTL_MS = 30_000; // 30 saniye cache

async function getCachedLiveEvents() {
  const now = Date.now();
  if (_eventCache && _eventCache.expiresAt > now) {
    return _eventCache.data;
  }
  const events = await prisma.liveEventConfig.findMany({
    where: { isEnabled: true, endsAt: { gt: new Date() }, deletedAt: null }
  });
  _eventCache = { data: events, expiresAt: now + EVENT_CACHE_TTL_MS };
  return events;
}

export function invalidateLiveEventCache() {
  _eventCache = null;
}

export async function getPublicLiveEvents() {
  return getCachedLiveEvents();
}

export async function createLiveEvent(data: {
  key: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  modifiersJson: string;
  isEnabled?: boolean;
}) {
  return prisma.liveEventConfig.create({ data });
}

export async function updateLiveEvent(key: string, data: {
  title?: string;
  startsAt?: Date;
  endsAt?: Date;
  modifiersJson?: string;
  isEnabled?: boolean;
}) {
  return prisma.liveEventConfig.update({ where: { key }, data });
}

export async function deleteLiveEvent(key: string) {
  return prisma.liveEventConfig.update({
    where: { key },
    data: { deletedAt: new Date(), isEnabled: false }
  });
}

export async function getActiveTapMultiplier(): Promise<number> {
  const events = await getCachedLiveEvents();
  let multiplier = 1;
  for (const event of events) {
    try {
      const mods = JSON.parse(event.modifiersJson) as Record<string, number>;
      if (mods.tapMultiplier && mods.tapMultiplier > multiplier) {
        multiplier = mods.tapMultiplier;
      }
    } catch { /* geçersiz JSON — atla */ }
  }
  return multiplier;
}

export async function getActiveChestLuckMultiplier(): Promise<number> {
  const events = await getCachedLiveEvents();
  let multiplier = 1;
  for (const event of events) {
    try {
      const mods = JSON.parse(event.modifiersJson) as Record<string, number>;
      if (mods.chestLuckMultiplier && mods.chestLuckMultiplier > multiplier) {
        multiplier = mods.chestLuckMultiplier;
      }
      if (mods.jackpotMultiplier) {
        const derived = mods.jackpotMultiplier * 0.5;
        if (derived > multiplier) multiplier = derived;
      }
    } catch { /* geçersiz JSON — atla */ }
  }
  return multiplier;
}

export async function startLiveEvent(eventKey: string) {
  const event = await prisma.liveEventConfig.findUnique({ where: { key: eventKey } });
  if (!event) throw new Error('Event not found');

  return prisma.liveEventConfig.update({
    where: { key: eventKey },
    data: {
      isEnabled: true,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 6 * 60 * 60 * 1000)
    }
  });
}

export async function stopLiveEvent(eventKey: string) {
  const event = await prisma.liveEventConfig.findUnique({ where: { key: eventKey } });
  if (!event) throw new Error('Event not found');

  return prisma.liveEventConfig.update({
    where: { key: eventKey },
    data: { isEnabled: false, endsAt: new Date() }
  });
}

export async function getLiveEvents() {
  return prisma.liveEventConfig.findMany({
    where: { deletedAt: null },
    orderBy: { startsAt: 'desc' }
  });
}

export async function getActiveEventsWithStats() {
  const now = new Date();
  const events = await prisma.liveEventConfig.findMany({
    where: { isEnabled: true, endsAt: { gt: now }, deletedAt: null }
  });
  return events.map(event => ({
    ...event,
    remainingMs: event.endsAt.getTime() - now.getTime(),
  }));
}
