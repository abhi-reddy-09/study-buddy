import { Router, Response, NextFunction } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createMatchSchema } from '../schemas/match';
import { prisma } from '../db';
import { AppError } from '../errors';

const router = Router();

// Initiate match
router.post('/', authenticateToken, validate(createMatchSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Access denied');
    }
    const { receiverId } = req.body;

    if (receiverId === req.userId) {
      throw new AppError(400, 'Cannot match with yourself');
    }

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      throw new AppError(404, 'User not found');
    }

    const existing = await prisma.match.findFirst({
      where: {
        OR: [
          { initiatorId: req.userId, receiverId },
          { initiatorId: receiverId, receiverId: req.userId },
        ],
      },
    });

    if (existing) {
      throw new AppError(400, 'Match already exists');
    }

    const match = await prisma.match.create({
      data: { initiatorId: req.userId, receiverId },
    });
    res.status(201).json(match);
  } catch (err) {
    next(err);
  }
});

// Get user's matches
router.get('/', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Access denied');
    }
    const matches = await prisma.match.findMany({
      where: { OR: [{ initiatorId: req.userId }, { receiverId: req.userId }] },
      include: { initiator: { select: { id: true, profile: true } }, receiver: { select: { id: true, profile: true } } },
    });
    res.json(matches);
  } catch (err) {
    next(err);
  }
});

// Accept match (only receiver can accept)
router.put('/:id/accept', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Access denied');
    }
    const id = req.params.id as string;
    const match = await prisma.match.findUnique({ where: { id } });

    if (!match) {
      throw new AppError(404, 'Match not found');
    }

    if (match.receiverId !== req.userId) {
      throw new AppError(403, 'Only receiver can accept');
    }

    if (match.status !== 'PENDING') {
      throw new AppError(400, 'Match already processed');
    }

    const updated = await prisma.match.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Reject match (only receiver can reject)
router.put('/:id/reject', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Access denied');
    }
    const id = req.params.id as string;
    const match = await prisma.match.findUnique({ where: { id } });

    if (!match) {
      throw new AppError(404, 'Match not found');
    }

    if (match.receiverId !== req.userId) {
      throw new AppError(403, 'Only receiver can reject');
    }

    if (match.status !== 'PENDING') {
      throw new AppError(400, 'Match already processed');
    }

    const updated = await prisma.match.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
