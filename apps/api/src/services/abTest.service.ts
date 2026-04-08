import { createHash } from 'crypto';
import { prisma } from '../lib/prisma';

// Deterministik atama: hash(userId + testId) % variantCount
export function assignVariant(userId: string, testId: string, variantCount: number): number {
  const hash = createHash('sha256').update(userId + testId).digest('hex');
  const num = parseInt(hash.slice(0, 8), 16);
  return num % variantCount;
}

export async function createTest(data: {
  key: string;
  title: string;
  description?: string;
  variantCount?: number;
}) {
  return prisma.aBTest.create({ data });
}

export async function concludeTest(testId: string, winnerVariant: number) {
  return prisma.aBTest.update({
    where: { id: testId },
    data: { status: 'concluded', winnerVariant, concludedAt: new Date() }
  });
}

export async function rolloutWinner(testId: string) {
  const test = await prisma.aBTest.findUnique({ where: { id: testId } });
  if (!test || test.winnerVariant === null) throw new Error('Test not concluded');

  // Kazanan variant'ı tüm atanmış kullanıcılara uygula
  const assignments = await prisma.userABTestAssignment.findMany({
    where: { testId, variant: test.winnerVariant }
  });

  const userIds = assignments.map(a => a.userId);
  if (userIds.length > 0) {
    await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { pricingVariant: `ab_winner_${test.key}` }
    });
  }

  return { rolledOut: userIds.length };
}

export async function assignUserToTest(userId: string, testId: string) {
  const test = await prisma.aBTest.findUnique({ where: { id: testId } });
  if (!test || test.status !== 'active') return null;

  const variant = assignVariant(userId, testId, test.variantCount);

  return prisma.userABTestAssignment.upsert({
    where: { userId_testId: { userId, testId } },
    create: { userId, testId, variant },
    update: {}
  });
}

export async function getActiveTestsForUser(userId: string) {
  const activeTests = await prisma.aBTest.findMany({
    where: { status: 'active' }
  });

  const results = await Promise.all(
    activeTests.map(async test => {
      const assignment = await assignUserToTest(userId, test.id);
      return { test, variant: assignment?.variant ?? null };
    })
  );

  return results;
}
