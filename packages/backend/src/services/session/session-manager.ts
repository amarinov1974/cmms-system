import { Redis } from 'ioredis';
import type { SessionData, SessionConfig } from './types.js';

const redisClient = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');

export class SessionManager {
  private config: SessionConfig;

  constructor(config: SessionConfig) {
    this.config = config;
  }

  async createSession(sessionId: string, data: Omit<SessionData, 'createdAt' | 'lastActivity'>): Promise<void> {
    const session: SessionData = {
      ...data,
      createdAt: new Date(),
      lastActivity: new Date(),
    };
    const ttlSeconds = this.config.timeoutMinutes * 60;
    await redisClient.set(
      `session:${sessionId}`,
      JSON.stringify(session),
      'EX',
      ttlSeconds
    );
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const raw = await redisClient.get(`session:${sessionId}`);
    if (!raw) return null;

    const session: SessionData = JSON.parse(raw);
    session.lastActivity = new Date();

    const ttlSeconds = this.config.timeoutMinutes * 60;
    await redisClient.set(
      `session:${sessionId}`,
      JSON.stringify(session),
      'EX',
      ttlSeconds
    );

    return session;
  }

  async updateSession(sessionId: string, updates: Partial<SessionData>): Promise<boolean> {
    const raw = await redisClient.get(`session:${sessionId}`);
    if (!raw) return false;

    const session: SessionData = JSON.parse(raw);
    const updated = { ...session, ...updates, lastActivity: new Date() };

    const ttlSeconds = this.config.timeoutMinutes * 60;
    await redisClient.set(
      `session:${sessionId}`,
      JSON.stringify(updated),
      'EX',
      ttlSeconds
    );

    return true;
  }

  async destroySession(sessionId: string): Promise<void> {
    await redisClient.del(`session:${sessionId}`);
  }

  async getActiveSessions(): Promise<number> {
    const keys = await redisClient.keys('session:*');
    return keys.length;
  }
}

export const sessionManager = new SessionManager({
  secret: process.env.SESSION_SECRET ?? 'dev-secret',
  timeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES ?? '10', 10),
  cookieName: 'cmms_session',
});
