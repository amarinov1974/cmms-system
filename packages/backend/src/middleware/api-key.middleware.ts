/**
 * API Key Middleware
 * Requires x-api-key header to match API_KEY env variable.
 * If API_KEY is not set, allows all requests (for local dev).
 */

import { Request, Response, NextFunction } from 'express';

export function apiKeyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const expectedKey = process.env.API_KEY;
  if (!expectedKey) {
    return next();
  }

  const providedKey = req.headers['x-api-key'];
  const key =
    typeof providedKey === 'string'
      ? providedKey
      : Array.isArray(providedKey)
        ? providedKey[0]
        : undefined;

  if (!key || key !== expectedKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}
