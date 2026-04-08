import { prisma } from "../lib/prisma";

export async function getRevenueSummary() {
  const [grossPaidStars, paidPayments, pendingWithdrawals, sentWithdrawals] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "paid", currency: "XTR" },
    }),
    prisma.payment.count({ where: { status: "paid" } }),
    prisma.withdrawalRequest.count({ where: { status: { in: ["pending", "under_review", "approved"] } } }),
    prisma.withdrawalRequest.count({ where: { status: "sent" } }),
  ]);

  return {
    grossPaidStars: grossPaidStars._sum.amount ?? 0,
    paidPayments,
    pendingWithdrawals,
    sentWithdrawals,
  };
}

export async function listPayoutRequests(page = 1, limit = 20) {
  const [items, total] = await Promise.all([
    prisma.withdrawalRequest.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: true },
    }),
    prisma.withdrawalRequest.count(),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
