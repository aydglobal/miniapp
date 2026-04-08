import { prisma } from '../lib/prisma';
import { getActiveBoostMap } from '../lib/boosts';
import { getMiningState } from './game.service';
import { resolveGameplayState } from './economyRuntime.service';

const MAX_USERS_PER_BATCH = 200;

export async function runAutoTapTick() {
  const users = await prisma.user.findMany({
    take: MAX_USERS_PER_BATCH,
    orderBy: { updatedAt: 'asc' },
    include: { boosts: true, ownedUpgrades: true }
  });

  let processed = 0;

  for (const user of users) {
    const boostState = getActiveBoostMap(
      user.boosts.map((boost) => ({
        type: boost.type,
        level: boost.level,
        isActive: boost.isActive,
        expiresAt: boost.expiresAt
      }))
    );

    // Gerçek economy runtime'dan level hesapla
    const gameplay = resolveGameplayState(user, user.ownedUpgrades);
    const passiveIncomePerHour = Math.max(120, Math.floor(gameplay.passiveIncomePerHour * boostState.tapMultiplier));

    const miningState = getMiningState({
      coins: user.coins,
      passiveIncomePerHour,
      level: gameplay.level,
      lastCollectedAt: user.lastPassiveIncomeAt || user.lastTapAt || user.createdAt,
      offlineCapHours: gameplay.offlineCapHours
    });

    if (miningState.pendingCoins < 5) continue;

    const nextCoins = user.coins + miningState.pendingCoins;
    const nextXp = user.xp + miningState.pendingCoins;
    // Level'ı economy runtime ile hesapla, basit formülle değil
    const nextGameplay = resolveGameplayState(
      { ...user, coins: nextCoins, xp: nextXp },
      user.ownedUpgrades
    );
    const now = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          coins: nextCoins,
          xp: nextXp,
          totalLifetimeCoins: { increment: miningState.pendingCoins },
          totalPassiveClaimed: { increment: miningState.pendingCoins },
          level: nextGameplay.level,
          maxEnergy: nextGameplay.maxEnergy,
          passiveIncomePerHour: gameplay.passiveIncomePerHour,
          lastPassiveIncomeAt: now
        }
      }),
      prisma.walletLedgerEntry.create({
        data: {
          userId: user.id,
          entryType: 'passive_income',
          bucket: 'coins',
          amount: miningState.pendingCoins,
          balanceBefore: user.coins,
          balanceAfter: nextCoins,
          reason: 'auto_tap_worker',
          metadataJson: JSON.stringify({ elapsedMinutes: miningState.elapsedMinutes, passiveIncomePerHour })
        }
      })
    ]);

    processed += 1;
  }

  return { processed, enabled: true };
}
