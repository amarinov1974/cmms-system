/**
 * Auth API
 */

import { apiClient, SESSION_STORAGE_KEY } from './client';

export interface DemoLoginRequest {
  userType: 'INTERNAL' | 'VENDOR';
  userId: number;
}

export interface User {
  id: number;
  name: string;
  role: string;
  companyId: number;
  companyName: string;
  storeId?: number;
  storeName?: string;
  regionId?: number;
  regionName?: string;
  vendorCompanyId?: number;
  vendorCompanyName?: string;
}

export interface DemoLoginResponse {
  success: boolean;
  sessionId?: string;
  user?: User;
  error?: string;
}

export interface SessionResponse {
  session: {
    userId: number;
    role: string;
    userType: 'INTERNAL' | 'VENDOR';
    companyId: number;
    userName: string;
    companyName: string;
    storeId?: number;
    storeName?: string;
    regionId?: number;
    regionName?: string;
    servicedCompanyName?: string;
  };
}

export const authAPI = {
  demoLogin: async (request: DemoLoginRequest): Promise<DemoLoginResponse> => {
    const { data } = await apiClient.post<DemoLoginResponse>(
      '/auth/demo-login',
      request
    );
    return data;
  },

  getSession: async (): Promise<SessionResponse> => {
    const { data } = await apiClient.get<SessionResponse>('/auth/session');
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  },

  getInternalUsers: async () => {
    const { data } = await apiClient.get<{ users: User[] }>(
      '/auth/users/internal'
    );
    return data.users;
  },

  getVendorUsers: async () => {
    const { data } = await apiClient.get<{ users: User[] }>(
      '/auth/users/vendor'
    );
    return data.users;
  },
};
