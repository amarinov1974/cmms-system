/**
 * Auth Service
 * Handles demo login (no password authentication)
 */

import { prisma } from '../../config/database.js';
import type { InternalRole, VendorRole } from '../../types/roles.js';
import type { DemoLoginRequest, DemoLoginResponse, LogoutResponse } from './types.js';
import { sessionManager } from '../session/session-manager.js';
import type { SessionData } from '../session/types.js';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  /**
   * Demo login - validate user exists and create session
   */
  async demoLogin(request: DemoLoginRequest): Promise<DemoLoginResponse> {
    try {
      if (request.userType === 'INTERNAL') {
        return await this.loginInternalUser(request.userId);
      }
      return await this.loginVendorUser(request.userId);
    } catch (error) {
      console.error('Demo login error:', error);
      return {
        success: false,
        error: 'Login failed',
      };
    }
  }

  /**
   * Login internal user (retail employee)
   */
  private async loginInternalUser(userId: number): Promise<DemoLoginResponse> {
    const user = await prisma.internalUser.findUnique({
      where: { id: userId, active: true },
      include: {
        company: true,
        store: true,
        region: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found or inactive',
      };
    }

    const sessionId = uuidv4();
    const sessionData: Omit<SessionData, 'createdAt' | 'lastActivity'> = {
      userId: user.id,
      role: user.role,
      userType: 'INTERNAL',
      companyId: user.companyId,
      storeId: user.storeId ?? undefined,
      regionId: user.regionId ?? undefined,
      userName: user.name,
      companyName: user.company.name,
      storeName: user.store?.name,
      regionName: user.region?.name,
    };

    sessionManager.createSession(sessionId, sessionData);

    const role = String(user.role);
    return {
      success: true,
      sessionId,
      user: {
        id: user.id,
        name: user.name,
        role: role as InternalRole | VendorRole,
        companyId: user.companyId,
        companyName: user.company.name,
        storeId: user.storeId ?? undefined,
        storeName: user.store?.name,
        regionId: user.regionId ?? undefined,
        regionName: user.region?.name,
      },
    };
  }

  /**
   * Login vendor user
   */
  private async loginVendorUser(userId: number): Promise<DemoLoginResponse> {
    const user = await prisma.vendorUser.findUnique({
      where: { id: userId, active: true },
      include: {
        vendorCompany: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found or inactive',
      };
    }

    const servicedCompany = await prisma.company.findFirst({
      select: { name: true },
    });

    const sessionId = uuidv4();
    const sessionData: Omit<SessionData, 'createdAt' | 'lastActivity'> = {
      userId: user.id,
      role: user.role,
      userType: 'VENDOR',
      companyId: user.vendorCompanyId,
      userName: user.name,
      companyName: user.vendorCompany.name,
      servicedCompanyName: servicedCompany?.name ?? undefined,
    };

    sessionManager.createSession(sessionId, sessionData);

    const role = String(user.role);
    return {
      success: true,
      sessionId,
      user: {
        id: user.id,
        name: user.name,
        role: role as InternalRole | VendorRole,
        companyId: user.vendorCompanyId,
        companyName: user.vendorCompany.name,
        servicedCompanyName: servicedCompany?.name,
      },
    };
  }

  /**
   * Logout - destroy session
   */
  logout(sessionId: string): LogoutResponse {
    sessionManager.destroySession(sessionId);
    return { success: true };
  }

  /**
   * Validate session
   */
  validateSession(sessionId: string): SessionData | null {
    return sessionManager.getSession(sessionId);
  }
}

export const authService = new AuthService();
