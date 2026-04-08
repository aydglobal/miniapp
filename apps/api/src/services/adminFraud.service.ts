import { prisma } from '../lib/prisma';

export async function listFraudCases(params: {
  status?: string;
  q?: string;
  skip: number;
  limit: number;
}) {
  const where: any = {};

  if (params.status) where.status = params.status;
  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: 'insensitive' } },
      { riskType: { contains: params.q, mode: 'insensitive' } },
      { user: { username: { contains: params.q, mode: 'insensitive' } } },
      { user: { telegramId: { contains: params.q, mode: 'insensitive' } } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.fraudCase.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            telegramId: true,
            suspiciousScore: true,
            trustScore: true,
            status: true
          }
        }
      },
      orderBy: [{ status: 'asc' }, { score: 'desc' }, { detectedAt: 'desc' }],
      skip: params.skip,
      take: params.limit
    }),
    prisma.fraudCase.count({ where })
  ]);

  return { items, total };
}

export async function resolveFraudCase(params: {
  caseId: string;
  adminId: string;
  status: 'resolved' | 'false_positive' | 'reviewing';
  note?: string;
}) {
  const existing = await prisma.fraudCase.findUnique({ where: { id: params.caseId } });
  if (!existing) throw new Error('Fraud case not found');

  const updated = await prisma.fraudCase.update({
    where: { id: params.caseId },
    data: {
      status: params.status,
      note: params.note,
      reviewedAt: new Date(),
      reviewedByAdminId: params.adminId
    }
  });

  await prisma.adminAction.create({
    data: {
      adminId: params.adminId,
      targetUserId: existing.userId,
      action: `fraud_case_${params.status}`,
      reason: params.note,
      meta: { caseId: params.caseId }
    }
  });

  return updated;
}
