import { prisma } from '../lib/prisma';
import { resolveGameplayState } from './economyRuntime.service';

export async function syncLevelState(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { ownedUpgrades: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const gameplay = resolveGameplayState(user, user.ownedUpgrades);

  if (
    user.level !== gameplay.level ||
    user.maxEnergy !== gameplay.maxEnergy ||
    Number(user.offlineCapHours || 0) !== gameplay.offlineCapHours
  ) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        level: gameplay.level,
        maxEnergy: gameplay.maxEnergy,
        offlineCapHours: gameplay.offlineCapHours
      }
    });
  }

  return {
    level: gameplay.level,
    xp: gameplay.progressionXp,
    unlocks: gameplay.levelUnlock.unlocks,
    nextFeatureUnlock: gameplay.nextFeatureUnlock,
    stats: {
      tapReward: gameplay.tapReward,
      maxEnergy: gameplay.maxEnergy,
      regenPerMinute: gameplay.regenPerMinute,
      offlineCapHours: gameplay.offlineCapHours,
      passiveCapPerHour: gameplay.passiveCapPerHour
    }
  };
}
