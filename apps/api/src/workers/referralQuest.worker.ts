import { prisma } from '../lib/prisma';
import { ensureNextReferralTasks } from '../services/referralQuest.service';

export async function runReferralQuestWorker() {
  const users = await prisma.user.findMany({
    take: 50,
    orderBy: { updatedAt: 'desc' },
    select: { id: true, firstPaidAt: true, referralRewardsGiven: true }
  });

  for (const user of users) {
    const segment =
      user.firstPaidAt ? 'whale' :
      user.referralRewardsGiven > 0 ? 'hot' :
      'warm';

    await ensureNextReferralTasks(user.id, segment);
  }

  return { processed: users.length };
}
