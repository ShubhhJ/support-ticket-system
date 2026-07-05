import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError } from './errorHandler.js';

type Source = 'body' | 'query' | 'params';

export function validate(schema: ZodTypeAny, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(new AppError(422, 'Validation failed', result.error.flatten().fieldErrors));
      return;
    }

    req.valid = { ...req.valid, [source]: result.data };
    next();
  };
}
