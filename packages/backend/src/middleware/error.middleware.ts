import type { Request, Response, NextFunction } from 'express';
import { WorkflowError } from '../core/errors/index.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('error-middleware');

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof WorkflowError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }
  if (err instanceof Error) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
}
