import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../db';
import {
  authenticateToken,
  AuthRequest,
  getJwtSecret,
  getAccessTokenExpiresIn,
  getRefreshTokenExpiresInSeconds,
} from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginLimiter } from '../middleware/rateLimit';
import { registerSchema, loginSchema, refreshSchema } from '../schemas/auth';
import { AppError } from '../errors';
import {
  createRefreshToken,
  findValidRefreshToken,
  revokeRefreshTokenById,
  revokeAllRefreshTokensForUser,
} from '../lib/refreshToken';

const router = Router();

// GET /auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Access denied');
    }
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, profile: true },
    });
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /auth/register (strict rate limit for brute-force protection)
router.post('/register', loginLimiter, validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, major, studyHabits, avatarUrl, gender } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: { firstName, lastName, major, studyHabits, avatarUrl, gender },
        },
      },
      include: { profile: true },
    });
    res.status(201).json({ user: { id: user.id, email: user.email, profile: user.profile } });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login (strict rate limit for brute-force protection)
router.post('/login', loginLimiter, validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError(401, 'Invalid credentials');
    }
    const accessExpiresIn = getAccessTokenExpiresIn();
    const accessToken = jwt.sign({ userId: user.id }, getJwtSecret(), {
      expiresIn: accessExpiresIn as NonNullable<SignOptions['expiresIn']>,
    });
    const refreshExpiresSeconds = getRefreshTokenExpiresInSeconds();
    const expiresAt = new Date(Date.now() + refreshExpiresSeconds * 1000);
    const { token: refreshToken } = await createRefreshToken(user.id, expiresAt);
    res.json({
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
      user: { id: user.id, email: user.email, profile: user.profile },
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/refresh — accepts refreshToken in body (or cookie if cookie-parser is added)
router.post('/refresh', validate(refreshSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = (req.body as { refreshToken: string }).refreshToken;
    const record = await findValidRefreshToken(refreshToken);
    if (!record) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }
    const user = await prisma.user.findUnique({
      where: { id: record.userId },
      include: { profile: true },
    });
    if (!user) {
      throw new AppError(401, 'User not found');
    }
    const accessExpiresIn = getAccessTokenExpiresIn();
    const accessToken = jwt.sign({ userId: user.id }, getJwtSecret(), {
      expiresIn: accessExpiresIn as NonNullable<SignOptions['expiresIn']>,
    });
    const refreshExpiresSeconds = getRefreshTokenExpiresInSeconds();
    const expiresAt = new Date(Date.now() + refreshExpiresSeconds * 1000);
    const { token: newRefreshToken } = await createRefreshToken(user.id, expiresAt);
    await revokeRefreshTokenById(record.id);
    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: accessExpiresIn,
      user: { id: user.id, email: user.email, profile: user.profile },
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout — invalidate refresh token(s); body may include refreshToken to revoke one, or use authenticated user to revoke all
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = (req.body as { refreshToken?: string })?.refreshToken;
    if (refreshToken) {
      const record = await findValidRefreshToken(refreshToken);
      if (record) await revokeRefreshTokenById(record.id);
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Authenticated logout: revoke all refresh tokens for the current user
router.post('/logout-all', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.userId) await revokeAllRefreshTokensForUser(req.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
