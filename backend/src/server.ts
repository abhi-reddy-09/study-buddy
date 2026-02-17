import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { prisma } from './db';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import discoveryRoutes from './routes/discovery';
import matchesRoutes from './routes/matches';
import { authenticateToken, AuthRequest } from './middleware/auth';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Study Buddy API is running' });
});

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/discovery', discoveryRoutes);
app.use('/matches', matchesRoutes);

app.get('/users', authenticateToken, async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, profile: true, createdAt: true, updatedAt: true },
  });
  res.json(users);
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

export { prisma, app };
