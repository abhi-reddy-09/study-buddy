import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

router.put('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Access denied' });
  }
  const { major, bio, studyHabits } = req.body;
  try {
    const profile = await prisma.profile.update({
      where: { userId: req.userId },
      data: { major, bio, studyHabits },
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
