import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { stableJsonHash } from "../lib/hash";

export function idempotencyMiddleware(scope: string) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const key = req.header("x-idempotency-key");

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      if (!key) {
        return res.status(400).json({ success: false, message: "Missing x-idempotency-key" });
      }

      const requestHash = stableJsonHash({
        path: req.path,
        method: req.method,
        body: req.body ?? {},
      });

      const existing = await prisma.idempotencyKey.findUnique({
        where: {
          userId_scope_idempotencyKey: {
            userId,
            scope,
            idempotencyKey: key,
          },
        },
      });

      if (existing) {
        if (existing.requestHash !== requestHash) {
          return res.status(409).json({
            success: false,
            message: "Idempotency key reuse with different payload",
          });
        }

        if (existing.status === "completed" && existing.responseJson) {
          return res.status(200).json(JSON.parse(existing.responseJson));
        }

        if (existing.status === "processing") {
          return res.status(409).json({
            success: false,
            message: "Duplicate request still processing",
          });
        }
      } else {
        await prisma.idempotencyKey.create({
          data: {
            userId,
            scope,
            idempotencyKey: key,
            requestHash,
            status: "processing",
          },
        });
      }

      const originalJson = res.json.bind(res);
      res.json = async (body: any) => {
        await prisma.idempotencyKey.update({
          where: {
            userId_scope_idempotencyKey: {
              userId,
              scope,
              idempotencyKey: key,
            },
          },
          data: {
            status: "completed",
            responseJson: JSON.stringify(body),
          },
        });
        return originalJson(body);
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}
