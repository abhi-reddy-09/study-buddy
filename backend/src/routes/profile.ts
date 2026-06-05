import { Router, Response, NextFunction } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../schemas/profile';
import { prisma } from '../db';
import { AppError } from '../errors';

const router = Router();

router.put('/', authenticateToken, validate(updateProfileSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Access denied');
    }
    const { major, bio, studyHabits, avatarUrl } = req.body;
    const updateData: Record<string, string | undefined> = {};
    if (major !== undefined) updateData.major = major;
    if (bio !== undefined) updateData.bio = bio;
    if (studyHabits !== undefined) updateData.studyHabits = studyHabits;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const profile = await prisma.profile.update({
      where: { userId: req.userId },
      data: updateData,
    });
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

export default router;
