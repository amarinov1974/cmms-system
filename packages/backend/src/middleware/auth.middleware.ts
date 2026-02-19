/**
 * Auth Middleware
 * Validates session for all protected routes
 */

import type { Request, Response, NextFunction } from 'express';
import { sessionManager } from '../services/session/session-manager.js';
import type { SessionData } from '../services/session/types.js';

declare global {
  namespace Express {
    interface Request {
      session?: SessionData;
    }
  }
}

/**
 * Require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const sessionId =
    req.cookies?.cmms_session ?? (req.headers['x-session-id'] as string | undefined);

  if (!sessionId) {
    res.status(401).json({ error: 'No session provided' });
    return;
  }

  const session = sessionManager.getSession(sessionId);

  if (!session) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return;
  }

  req.session = session;
  next();
}

/**
 * Require specific role
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session) {
      res.status(401).json({ error: 'No session' });
      return;
    }

    if (!allowedRoles.includes(req.session.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

/**
 * Optional auth (attach session if present, but don't require it)
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const sessionId =
    req.cookies?.cmms_session ?? (req.headers['x-session-id'] as string | undefined);

  if (sessionId) {
    const session = sessionManager.getSession(sessionId);
    if (session) {
      req.session = session;
    }
  }

  next();
}
