import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
}

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured. Set JWT_SECRET in your environment variables.');
  }
  return secret;
};

export const getAccessTokenExpiresIn = (): string => {
  return process.env.JWT_ACCESS_EXPIRES_IN || '1h';
};

export const getRefreshTokenExpiresInSeconds = (): number => {
  const raw = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  const match = raw.match(/^(\d+)([smhd])$/);
  if (!match || match[1] === undefined || match[2] === undefined) return 7 * 24 * 60 * 60; // default 7 days
  const n = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return n * (multipliers[unit] ?? 86400);
};

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, getJwtSecret()) as { userId: string };
    req.userId = verified.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Use after authenticateToken. Restricts access to the given roles (e.g. ADMIN, MOD).
 * Loads user role from DB and returns 403 if not in the allowed list.
 */
export const requireRole = (...allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Access denied' });
    }
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true },
      });
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      req.role = user.role;
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
