import type { NextFunction, Request, Response } from 'express';
import { env } from './env';

export function assertAdminSecret(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers['x-admin-secret'];
  if (secret !== env.ADMIN_SECRET) {
    return res.status(403).json({ message: 'Admin only' });
  }

  (req as any).adminId = 'local-admin';
  next();
}

export function parsePagination(req: Request) {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
}
