import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// Initiate match
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
        return res.status(401).json({ error: 'Access denied' });
    }
    const { receiverId } = req.body;

    if (receiverId === req.userId) {
        return res.status(400).json({ error: 'Cannot match with yourself' });
    }

    try {
        const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
        if (!receiver) {
            return res.status(404).json({ error: 'User not found' });
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
            return res.status(400).json({ error: 'Match already exists' });
        }

        const match = await prisma.match.create({
            data: { initiatorId: req.userId, receiverId },
        });
        res.status(201).json(match);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create match' });
    }
});

// Get user's matches
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
        return res.status(401).json({ error: 'Access denied' });
    }
    try {
        const matches = await prisma.match.findMany({
            where: { OR: [{ initiatorId: req.userId }, { receiverId: req.userId }] },
            include: { initiator: { select: { id: true, profile: true } }, receiver: { select: { id: true, profile: true } } },
        });
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get matches' });
    }
});

// Accept match (only receiver can accept)
router.put('/:id/accept', authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
        return res.status(401).json({ error: 'Access denied' });
    }
    const id = req.params.id as string;
    try {
        const match = await prisma.match.findUnique({ where: { id } });

        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        if (match.receiverId !== req.userId) {
            return res.status(403).json({ error: 'Only receiver can accept' });
        }

        if (match.status !== 'PENDING') {
            return res.status(400).json({ error: 'Match already processed' });
        }

        const updated = await prisma.match.update({
            where: { id },
            data: { status: 'ACCEPTED' },
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to accept match' });
    }
});

// Reject match (only receiver can reject)
router.put('/:id/reject', authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
        return res.status(401).json({ error: 'Access denied' });
    }
    const id = req.params.id as string;
    try {
        const match = await prisma.match.findUnique({ where: { id } });

        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        if (match.receiverId !== req.userId) {
            return res.status(403).json({ error: 'Only receiver can reject' });
        }

        if (match.status !== 'PENDING') {
            return res.status(400).json({ error: 'Match already processed' });
        }

        const updated = await prisma.match.update({
            where: { id },
            data: { status: 'REJECTED' },
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject match' });
    }
});

export default router;
