import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/boost-logs', async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.min(100, Math.max(10, Number(req.query.pageSize || 25)));
  const action = req.query.action ? String(req.query.action) : undefined;
  const source = req.query.source ? String(req.query.source) : undefined;

  const where: any = {};
  if (action) where.action = action;
  if (source) where.source = source;

  const [items, total] = await Promise.all([
    prisma.boostLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: {
          select: {
            username: true,
            telegramId: true,
            displayName: true
          }
        }
      }
    }),
    prisma.boostLog.count({ where })
  ]);

  res.json({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  });
});

export default router;
