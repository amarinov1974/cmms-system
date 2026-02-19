/**
 * Auth Types
 */

import type { InternalRole, VendorRole } from '../../types/roles.js';

export interface DemoLoginRequest {
  userType: 'INTERNAL' | 'VENDOR';
  userId: number;
}

export interface DemoLoginResponse {
  success: boolean;
  sessionId?: string;
  user?: {
    id: number;
    name: string;
    role: InternalRole | VendorRole;
    companyId: number;
    companyName: string;
    storeId?: number;
    storeName?: string;
    regionId?: number;
    regionName?: string;
    servicedCompanyName?: string;
  };
  error?: string;
}

export interface LogoutResponse {
  success: boolean;
}
