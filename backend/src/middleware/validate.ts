import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../errors';

export const validate = (schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const result = schema.parse(data);
      req[source] = result;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const firstIssue = err.issues[0];
        const message = firstIssue?.message ?? 'Validation failed';
        next(new AppError(400, message));
      } else {
        next(err);
      }
    }
  };
};
