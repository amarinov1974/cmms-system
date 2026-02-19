/**
 * Stores API (for AMM store selector on Submit Ticket)
 */

import { apiClient } from './client';

export interface Store {
  id: number;
  name: string;
  address?: string | null;
}

export const storesAPI = {
  list: async (): Promise<Store[]> => {
    const { data } = await apiClient.get<{ stores: Store[] }>('/stores');
    return data.stores;
  },
};
