/**
 * Session Manager
 * Handles session creation, validation, and timeout
 */

import type { SessionData, SessionConfig } from './types.js';

// In-memory session store (replace with Redis in production)
const sessions = new Map<string, SessionData>();

export class SessionManager {
  private config: SessionConfig;

  constructor(config: SessionConfig) {
    this.config = config;
  }

  /**
   * Create a new session
   */
  createSession(sessionId: string, data: Omit<SessionData, 'createdAt' | 'lastActivity'>): void {
    sessions.set(sessionId, {
      ...data,
      createdAt: new Date(),
      lastActivity: new Date(),
    });
  }

  /**
   * Get session data
   */
  getSession(sessionId: string): SessionData | null {
    const session = sessions.get(sessionId);

    if (!session) {
      return null;
    }

    // Check if session expired (10 minutes of inactivity)
    const now = new Date();
    const inactivityMs = now.getTime() - session.lastActivity.getTime();
    const timeoutMs = this.config.timeoutMinutes * 60 * 1000;

    if (inactivityMs > timeoutMs) {
      this.destroySession(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = now;
    sessions.set(sessionId, session);

    return session;
  }

  /**
   * Update session data
   */
  updateSession(sessionId: string, updates: Partial<SessionData>): boolean {
    const session = sessions.get(sessionId);

    if (!session) {
      return false;
    }

    sessions.set(sessionId, {
      ...session,
      ...updates,
      lastActivity: new Date(),
    });

    return true;
  }

  /**
   * Destroy session
   */
  destroySession(sessionId: string): void {
    sessions.delete(sessionId);
  }

  /**
   * Get all active sessions (for debugging)
   */
  getActiveSessions(): number {
    return sessions.size;
  }

  /**
   * Clean up expired sessions (run periodically)
   */
  cleanupExpiredSessions(): number {
    const now = new Date();
    const timeoutMs = this.config.timeoutMinutes * 60 * 1000;
    let cleaned = 0;

    for (const [sessionId, session] of sessions.entries()) {
      const inactivityMs = now.getTime() - session.lastActivity.getTime();
      if (inactivityMs > timeoutMs) {
        sessions.delete(sessionId);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Singleton instance
export const sessionManager = new SessionManager({
  secret: process.env.SESSION_SECRET ?? 'dev-secret',
  timeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES ?? '10', 10),
  cookieName: 'cmms_session',
});
