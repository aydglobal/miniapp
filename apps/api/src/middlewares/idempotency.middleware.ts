import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

function stableJsonHash(value: Record<string, unknown>) {
  return JSON.stringify(value, Object.keys(value).sort());
}

export function idempotencyMiddleware(scope: string) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const key = req.header('x-idempotency-key');

      if (!userId || !key) {
        return next();
      }

      const requestHash = stableJsonHash({
        path: req.path,
        method: req.method,
        body: req.body ?? {}
      });

      const existing = await prisma.idempotencyKey.findUnique({
        where: {
          userId_scope_idempotencyKey: {
            userId,
            scope,
            idempotencyKey: key
          }
        }
      });

      if (existing) {
        if (existing.requestHash !== requestHash) {
          return res.status(409).json({ success: false, message: 'Idempotency key farkli payload ile tekrarlandi' });
        }

        if (existing.status === 'completed' && existing.responseJson) {
          return res.status(200).json(JSON.parse(existing.responseJson));
        }

        if (existing.status === 'processing') {
          return res.status(409).json({ success: false, message: 'Ayni istek zaten isleniyor' });
        }
      } else {
        await prisma.idempotencyKey.create({
          data: {
            userId,
            scope,
            idempotencyKey: key,
            requestHash,
            status: 'processing'
          }
        });
      }

      const originalJson = res.json.bind(res);
      res.json = ((body: unknown) => {
        void prisma.idempotencyKey.update({
          where: {
            userId_scope_idempotencyKey: {
              userId,
              scope,
              idempotencyKey: key
            }
          },
          data: {
            status: 'completed',
            responseJson: JSON.stringify(body)
          }
        });

        return originalJson(body);
      }) as typeof res.json;

      next();
    } catch (error) {
      next(error);
    }
  };
}
