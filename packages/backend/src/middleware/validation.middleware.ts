import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';

/**
 * Validate request body against a Zod schema.
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const err = result.error;
      res.status(400).json({
        error: 'Validation failed',
        details: err.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validate request query against a Zod schema.
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const err = result.error;
      res.status(400).json({
        error: 'Validation failed',
        details: err.flatten().fieldErrors,
      });
      return;
    }
    req.query = result.data as Request['query'];
    next();
  };
}
