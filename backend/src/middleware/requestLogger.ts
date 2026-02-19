import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { log } from '../lib/logger';
import { httpRequestsTotal, httpRequestDurationMs } from '../lib/metrics';

declare global {
  namespace Express {
    interface Request {
      traceId?: string;
    }
  }
}

function routeLabel(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return 'root';
  return '/' + segments.slice(0, 2).join('/');
}

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  const traceId = (req.headers['x-trace-id'] as string) || crypto.randomUUID();
  req.traceId = traceId;
  const start = Date.now();

  _res.on('finish', () => {
    const durationMs = Date.now() - start;
    const authReq = req as Request & { userId?: string };
    log.info({
      traceId,
      method: req.method,
      url: req.originalUrl,
      statusCode: _res.statusCode,
      durationMs,
      ...(authReq.userId && { userId: authReq.userId }),
    });
    const route = routeLabel(req.originalUrl.split('?')[0] ?? '');
    const statusCode = String(_res.statusCode);
    httpRequestsTotal.inc({ method: req.method, route, status_code: statusCode });
    httpRequestDurationMs.observe({ method: req.method, route, status_code: statusCode }, durationMs);
  });

  next();
};
