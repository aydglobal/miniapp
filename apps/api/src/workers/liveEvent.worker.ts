import { prisma } from '../lib/prisma';

export async function scheduleLiveEvents() {
  const now = new Date();

  // Başlangıç zamanı geçmiş ama henüz aktif olmayan eventleri etkinleştir
  await prisma.liveEventConfig.updateMany({
    where: {
      isEnabled: false,
      startsAt: { lte: now },
      endsAt: { gt: now },
      deletedAt: null
    },
    data: { isEnabled: true }
  });

  // Bitiş zamanı geçmiş aktif eventleri devre dışı bırak
  await prisma.liveEventConfig.updateMany({
    where: {
      isEnabled: true,
      endsAt: { lte: now },
      deletedAt: null
    },
    data: { isEnabled: false }
  });
}

export function startLiveEventWorker() {
  // Her dakika çalıştır
  const interval = setInterval(async () => {
    try {
      await scheduleLiveEvents();
    } catch (err) {
      console.error('[liveEvent.worker] scheduleLiveEvents error:', err);
    }
  }, 60 * 1000);

  return interval;
}
