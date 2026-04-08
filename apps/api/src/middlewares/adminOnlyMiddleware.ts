import type { NextFunction, Request, Response } from 'express';
import { env } from '../lib/env';

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  FRAUD_REVIEWER = 'fraud_reviewer',
  ANALYTICS_VIEWER = 'analytics_viewer',
  CAMPAIGN_MANAGER = 'campaign_manager',
}

export function adminOnlyMiddleware(req: Request, res: Response, next: NextFunction) {
  const adminSecret = req.header('x-admin-secret');

  // Admin secret doğruysa token/isAdmin kontrolü atla
  if (adminSecret === env.ADMIN_SECRET) {
    return next();
  }

  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  next();
}

// Belirli bir role sahip olup olmadığını kontrol eden middleware factory
export function requireAdminRole(role: AdminRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const userRole = (req.user as any).adminRole as string | undefined;

    // super_admin her şeye erişebilir
    if (userRole === AdminRole.SUPER_ADMIN) return next();

    if (userRole !== role) {
      return res.status(403).json({
        success: false,
        message: `Bu işlem için '${role}' rolü gereklidir`
      });
    }

    next();
  };
}
