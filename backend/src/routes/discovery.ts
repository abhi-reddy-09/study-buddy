import { Router, Response, NextFunction } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';
import { AppError } from '../errors';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Access denied');
    }
    const userId = req.userId;
    const matchedUserIds = await prisma.match.findMany({
      where: {
        OR: [{ initiatorId: userId }, { receiverId: userId }],
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
      select: { initiatorId: true, receiverId: true },
    }).then(matches => matches.flatMap(m => [m.initiatorId, m.receiverId]).filter(id => id !== userId));

    const users = await prisma.user.findMany({
      where: { id: { not: userId, notIn: matchedUserIds } },
      select: { id: true, profile: true },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

export default router;
