/**
 * Assets API (lookup for ticket submit screen)
 */

import { apiClient } from './client';

export interface Asset {
  id: number;
  description: string;
  storeId: number;
}

export const assetsAPI = {
  getById: async (id: number): Promise<Asset | null> => {
    try {
      const { data } = await apiClient.get<Asset>(`/assets/${id}`);
      return data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) return null;
      throw err;
    }
  },
};
