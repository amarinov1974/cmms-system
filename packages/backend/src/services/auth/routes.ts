/**
 * Auth Routes
 */

import { Router } from 'express';
import { authService } from './auth-service.js';
import type { DemoLoginRequest } from './types.js';
import { prisma } from '../../config/database.js';

const router = Router();

/**
 * POST /api/auth/demo-login
 * Demo login endpoint
 */
router.post('/demo-login', async (req, res) => {
  try {
    const request = req.body as DemoLoginRequest;

    if (!request.userType || request.userId == null) {
      res.status(400).json({ error: 'Missing userType or userId' });
      return;
    }

    const result = await authService.demoLogin(request);

    if (result.success && result.sessionId) {
      res.cookie('cmms_session', result.sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 10 * 60 * 1000, // 10 minutes
      });

      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * Logout endpoint
 */
router.post('/logout', (req, res) => {
  const sessionId = req.cookies?.cmms_session;

  if (sessionId) {
    authService.logout(sessionId);
    res.clearCookie('cmms_session');
  }

  res.json({ success: true });
});

/**
 * GET /api/auth/session
 * Get current session info
 */
router.get('/session', (req, res) => {
  let sessionId = req.cookies?.cmms_session ?? req.headers['x-session-id'];
  if (Array.isArray(sessionId)) sessionId = sessionId[0];
  if (typeof sessionId !== 'string' || !sessionId.trim()) {
    res.status(401).json({ error: 'No session' });
    return;
  }

  const session = authService.validateSession(sessionId.trim());

  if (!session) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return;
  }

  // Send a plain object with string role so the client always gets a consistent shape
  res.json({
    session: {
      userId: session.userId,
      role: String(session.role ?? ''),
      userType: session.userType,
      companyId: session.companyId,
      userName: session.userName,
      companyName: session.companyName,
      storeId: session.storeId,
      storeName: session.storeName,
      regionId: session.regionId,
      regionName: session.regionName,
      servicedCompanyName: session.servicedCompanyName,
    },
  });
});

const INTERNAL_ROLE_ORDER = ['SM', 'AM', 'AMM', 'D', 'C2', 'BOD'];

/**
 * GET /api/auth/users/internal
 * Get list of internal users (for demo login dropdown), ordered by role then store.
 */
router.get('/users/internal', async (_req, res) => {
  try {
    const users = await prisma.internalUser.findMany({
      where: { active: true },
      include: {
        company: true,
        store: true,
        region: true,
      },
    });

    const roleOrder = (role: string) => {
      const i = INTERNAL_ROLE_ORDER.indexOf(role);
      return i === -1 ? 999 : i;
    };

    const roleStr = (r: { role: string }): string => String(r.role);

    const sorted = [...users].sort((a, b) => {
      const roleA = roleOrder(roleStr(a));
      const roleB = roleOrder(roleStr(b));
      if (roleA !== roleB) return roleA - roleB;
      if (roleStr(a) === 'SM' && roleStr(b) === 'SM') {
        return (a.storeId ?? 0) - (b.storeId ?? 0);
      }
      return a.name.localeCompare(b.name);
    });

    res.json({
      users: sorted.map((u) => ({
        id: u.id,
        name: u.name,
        role: roleStr(u),
        companyId: u.companyId,
        companyName: u.company?.name ?? '',
        storeId: u.storeId ?? undefined,
        storeName: u.store?.name ?? undefined,
        regionId: u.regionId ?? undefined,
        regionName: u.region?.name ?? undefined,
      })),
    });
  } catch (error) {
    const err = error as Error;
    console.error('Get users error:', err);
    const message = process.env.NODE_ENV !== 'production' ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

const VENDOR_ROLE_ORDER = ['S1', 'S2', 'S3'];

/**
 * GET /api/auth/users/vendor
 * Get list of vendor users (for demo login dropdown), ordered by role.
 */
router.get('/users/vendor', async (_req, res) => {
  try {
    const users = await prisma.vendorUser.findMany({
      where: { active: true },
      include: {
        vendorCompany: true,
      },
    });

    const roleOrder = (role: string) => {
      const i = VENDOR_ROLE_ORDER.indexOf(role);
      return i === -1 ? 999 : i;
    };

    const roleStr = (r: { role: string }): string => String(r.role);

    const sorted = [...users].sort((a, b) => {
      const roleA = roleOrder(roleStr(a));
      const roleB = roleOrder(roleStr(b));
      if (roleA !== roleB) return roleA - roleB;
      return a.name.localeCompare(b.name);
    });

    res.json({
      users: sorted.map((u) => ({
        id: u.id,
        name: u.name,
        role: roleStr(u),
        vendorCompanyId: u.vendorCompanyId,
        vendorCompanyName: u.vendorCompany?.name ?? '',
      })),
    });
  } catch (error) {
    const err = error as Error;
    console.error('Get vendor users error:', err);
    const message = process.env.NODE_ENV !== 'production' ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

export default router;
