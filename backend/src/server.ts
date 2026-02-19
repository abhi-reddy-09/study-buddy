import path from 'path';
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { prisma, checkDatabaseConnection, getConnectionInfo } from './db';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import discoveryRoutes from './routes/discovery';
import matchesRoutes from './routes/matches';
import { authenticateToken, AuthRequest } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { generalLimiter, authLimiter } from './middleware/rateLimit';
import { getMetrics, getContentType } from './lib/metrics';

if (process.env.NODE_ENV !== 'test' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured. Set JWT_SECRET in your environment variables.');
}

const app: Express = express();
const port = process.env.PORT || 5000;

// Security: helmet for HTTP headers
app.use(helmet());

// CORS: per-environment. Production requires ALLOWED_ORIGIN; dev/test use fallback.
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',').map((o) => o.trim())
  : isProduction
    ? []
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];
if (isProduction && allowedOrigins.length === 0) {
  throw new Error('ALLOWED_ORIGIN must be set in production.');
}
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

// Request logging with trace IDs
app.use(requestLogger);

// Body parsing
app.use(express.json());

// Health endpoints (before rate limit so probes are not limited)
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'unready', reason: 'database' });
  }
});

app.get('/metrics', async (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', getContentType());
    res.send(await getMetrics());
  } catch (err) {
    res.status(500).send(String(err));
  }
});

app.use(generalLimiter);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Study Buddy API is running' });
});

app.use('/auth', authLimiter, authRoutes);
app.use('/profile', profileRoutes);
app.use('/discovery', discoveryRoutes);
app.use('/matches', matchesRoutes);

app.get('/users', authenticateToken, async (req: AuthRequest, res: Response, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, profile: true, createdAt: true, updatedAt: true },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Centralized error handler (must be last)
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  checkDatabaseConnection()
    .then(() => {
      app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
        console.log('[server]: Database connection OK');
      });
    })
    .catch((err) => {
      const { host, port, database } = getConnectionInfo();
      console.error('[server]: Database unreachable. Login and all DB routes will fail.');
      console.error(`[server]: Trying to connect to ${host}:${port}/${database || '(no database)'}`);
      console.error('[server]: Check DATABASE_URL in backend/.env — use 127.0.0.1 if localhost fails; ensure the database exists and the user has access.');
      console.error('[server]: Error:', err.message);
      process.exit(1);
    });
}

export { prisma, app };
