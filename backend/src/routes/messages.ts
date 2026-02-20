import { Router, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../db';
import { AppError } from '../errors';

const router = Router();

router.get('/conversations', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new AppError(401, 'Access denied');
    }

    const matches = await prisma.match.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ initiatorId: userId }, { receiverId: userId }],
      },
      include: {
        initiator: { select: { id: true, profile: true } },
        receiver: { select: { id: true, profile: true } },
      },
    });

    const conversations = await Promise.all(
      matches.map(async (m) => {
        const other = m.initiatorId === userId ? m.receiver : m.initiator;
        const otherId = other.id;

        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: otherId },
              { senderId: otherId, receiverId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        const unreadCount = await prisma.message.count({
          where: {
            senderId: otherId,
            receiverId: userId,
            readAt: null,
          },
        });

        const profile = other.profile;
        return {
          otherUser: {
            id: other.id,
            firstName: profile?.firstName ?? '',
            lastName: profile?.lastName ?? '',
            avatarUrl: profile?.avatarUrl ?? null,
          },
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                createdAt: lastMessage.createdAt.toISOString(),
                senderId: lastMessage.senderId,
                readAt: lastMessage.readAt?.toISOString() ?? null,
              }
            : null,
          unreadCount,
        };
      })
    );

    res.json(conversations);
  } catch (err) {
    next(err);
  }
});

router.get(
  '/conversations/:otherUserId',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const otherUserId = req.params.otherUserId as string;
      if (!userId) {
        throw new AppError(401, 'Access denied');
      }

      const match = await prisma.match.findFirst({
        where: {
          status: 'ACCEPTED',
          OR: [
            { initiatorId: userId, receiverId: otherUserId },
            { initiatorId: otherUserId, receiverId: userId },
          ],
        },
      });
      if (!match) {
        throw new AppError(403, 'Not allowed to view this conversation');
      }

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });

      res.json(
        messages.map((m) => ({
          id: m.id,
          content: m.content,
          senderId: m.senderId,
          receiverId: m.receiverId,
          createdAt: m.createdAt.toISOString(),
          readAt: m.readAt?.toISOString() ?? null,
        }))
      );
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/conversations/:otherUserId/read',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const otherUserId = req.params.otherUserId as string;
      if (!userId) {
        throw new AppError(401, 'Access denied');
      }

      const match = await prisma.match.findFirst({
        where: {
          status: 'ACCEPTED',
          OR: [
            { initiatorId: userId, receiverId: otherUserId },
            { initiatorId: otherUserId, receiverId: userId },
          ],
        },
      });
      if (!match) {
        throw new AppError(403, 'Not allowed');
      }

      await prisma.message.updateMany({
        where: {
          senderId: otherUserId,
          receiverId: userId,
          readAt: null,
        },
        data: { readAt: new Date() },
      });

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/conversations/:otherUserId',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const otherUserId = req.params.otherUserId as string;
      if (!userId) {
        throw new AppError(401, 'Access denied');
      }

      const match = await prisma.match.findFirst({
        where: {
          status: 'ACCEPTED',
          OR: [
            { initiatorId: userId, receiverId: otherUserId },
            { initiatorId: otherUserId, receiverId: userId },
          ],
        },
      });
      if (!match) {
        throw new AppError(403, 'Not allowed');
      }

      await prisma.message.deleteMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
      });

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
