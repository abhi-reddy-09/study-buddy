import { Router, Response, NextFunction } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { passSchema } from '../schemas/discovery';
import { prisma } from '../db';
import { AppError } from '../errors';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Access denied');
    }
    const userId = req.userId;
    const [matchedUserIds, passedUserIds] = await Promise.all([
      prisma.match.findMany({
        where: {
          OR: [{ initiatorId: userId }, { receiverId: userId }],
          status: { in: ['PENDING', 'ACCEPTED'] },
        },
        select: { initiatorId: true, receiverId: true },
      }).then(matches => matches.flatMap(m => [m.initiatorId, m.receiverId]).filter(id => id !== userId)),
      prisma.pass.findMany({
        where: { userId },
        select: { passedUserId: true },
      }).then(passes => passes.map(p => p.passedUserId)),
    ]);
    const excludeIds = [...new Set([...matchedUserIds, ...passedUserIds])];
    const users = await prisma.user.findMany({
      where: { id: { not: userId, notIn: excludeIds } },
      select: { id: true, profile: true },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

/** Record that the current user passed (swiped left) on passedUserId so they won't see them again. */
router.post('/pass', authenticateToken, validate(passSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Access denied');
    }
    const userId = req.userId;
    const { passedUserId } = req.body as { passedUserId: string };
    if (passedUserId === userId) {
      throw new AppError(400, 'Cannot pass on yourself');
    }
    const targetUser = await prisma.user.findUnique({ where: { id: passedUserId } });
    if (!targetUser) {
      throw new AppError(404, 'User not found');
    }
    await prisma.pass.upsert({
      where: {
        userId_passedUserId: { userId, passedUserId },
      },
      create: { userId, passedUserId },
      update: {},
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
