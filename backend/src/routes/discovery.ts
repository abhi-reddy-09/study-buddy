import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../server';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Access denied' });
  }
  const userId = req.userId;
  try {
    const matchedUserIds = await prisma.match.findMany({
      where: { OR: [{ initiatorId: userId }, { receiverId: userId }] },
      select: { initiatorId: true, receiverId: true },
    }).then(matches => matches.flatMap(m => [m.initiatorId, m.receiverId]).filter(id => id !== userId));

    const users = await prisma.user.findMany({
      where: { id: { not: userId, notIn: matchedUserIds } },
      select: { id: true, profile: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
});

export default router;
