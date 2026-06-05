import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../middleware/auth';
import { prisma } from '../db';

const MAX_MESSAGE_LENGTH = 10_000;

export function initSocket(server: http.Server, allowedOrigins: string[]) {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error('Unauthorized'));
    }
    try {
      const verified = jwt.verify(token, getJwtSecret()) as { userId: string };
      socket.data.userId = verified.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    const userRoom = `user:${userId}`;
    socket.join(userRoom);

    socket.on('send_message', async (payload: { receiverId: string; content: string }) => {
      try {
        const { receiverId, content } = payload ?? {};
        if (!userId || !receiverId || typeof content !== 'string') {
          socket.emit('error', { message: 'Invalid payload' });
          return;
        }
        const trimmed = content.trim();
        if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) {
          socket.emit('error', { message: 'Invalid content' });
          return;
        }

        const match = await prisma.match.findFirst({
          where: {
            status: 'ACCEPTED',
            OR: [
              { initiatorId: userId, receiverId },
              { initiatorId: receiverId, receiverId: userId },
            ],
          },
        });
        if (!match) {
          socket.emit('error', { message: 'Not allowed to message this user' });
          return;
        }

        const message = await prisma.message.create({
          data: {
            senderId: userId,
            receiverId,
            content: trimmed,
          },
        });

        const payloadOut = {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          receiverId: message.receiverId,
          createdAt: message.createdAt.toISOString(),
          readAt: message.readAt?.toISOString() ?? null,
        };

        socket.emit('message_sent', payloadOut);
        io.to(`user:${receiverId}`).emit('new_message', payloadOut);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    const checkAcceptedMatch = async (otherUserId: string) => {
      const match = await prisma.match.findFirst({
        where: {
          status: 'ACCEPTED',
          OR: [
            { initiatorId: userId, receiverId: otherUserId },
            { initiatorId: otherUserId, receiverId: userId },
          ],
        },
      });
      return !!match;
    };

    socket.on('typing_start', async (payload: { otherUserId: string }) => {
      const otherUserId = payload?.otherUserId;
      if (!otherUserId) return;
      const allowed = await checkAcceptedMatch(otherUserId);
      if (!allowed) return;
      io.to(`user:${otherUserId}`).emit('user_typing', { userId });
    });

    socket.on('typing_stop', async (payload: { otherUserId: string }) => {
      const otherUserId = payload?.otherUserId;
      if (!otherUserId) return;
      const allowed = await checkAcceptedMatch(otherUserId);
      if (!allowed) return;
      io.to(`user:${otherUserId}`).emit('user_stopped_typing', { userId });
    });

    socket.on('mark_read', async (payload: { otherUserId: string }) => {
      try {
        const otherUserId = payload?.otherUserId;
        if (!userId || !otherUserId) return;
        const allowed = await checkAcceptedMatch(otherUserId);
        if (!allowed) return;

        await prisma.message.updateMany({
          where: {
            senderId: otherUserId,
            receiverId: userId,
            readAt: null,
          },
          data: { readAt: new Date() },
        });

        io.to(`user:${otherUserId}`).emit('message_read', {
          readerId: userId,
          conversationPartnerId: otherUserId,
        });
      } catch {
        // ignore
      }
    });
  });

  return io;
}
