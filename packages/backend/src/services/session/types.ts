/**
 * Session Types
 */

import type { InternalRole, VendorRole } from '../../types/roles.js';

export interface SessionData {
  userId: number;
  role: InternalRole | VendorRole;
  userType: 'INTERNAL' | 'VENDOR';
  companyId: number; // Retail company for internal, vendor company for vendor
  storeId?: number; // For Store Managers only
  regionId?: number; // For regional roles (AM, AMM)
  userName: string;
  companyName: string;
  storeName?: string;
  regionName?: string;
  servicedCompanyName?: string; // Client company name (for vendor users)
  createdAt: Date;
  lastActivity: Date;
}

export interface SessionConfig {
  secret: string;
  timeoutMinutes: number;
  cookieName: string;
}
