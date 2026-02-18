import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { log } from '../lib/logger';

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const traceId = (req as Request & { traceId?: string }).traceId;
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  const errName = err instanceof Error ? err.constructor.name : '';
  if (errName === 'PrismaClientKnownRequestError') {
    const prismaErr = err as { code?: string };
    if (prismaErr.code === 'P2002') {
      return res.status(409).json({ error: 'Resource already exists' });
    }
    if (prismaErr.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found' });
    }
    return res.status(400).json({ error: 'Database error' });
  }

  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  log.error({
    traceId,
    message: 'Unhandled error',
    error: message,
    stack,
    statusCode,
  });
  return res.status(500).json({ error: 'Internal server error' });
};
