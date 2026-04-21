/**
 * Preventive Maintenance API
 */

import { apiClient } from './client';

export interface ParsedPmRow {
  asset_name: string;
  task_description: string;
  vendor_company_id: number;
  vendor_user_id?: number;
  schedule_type: 'INTERVAL' | 'SPECIFIC_DATES';
  interval_days?: number;
  specific_dates?: string;
}

export interface ParseResult {
  rows: ParsedPmRow[];
  errors: string[];
}

export interface ImportResult {
  success: boolean;
  created: number;
  errors?: string[];
  summary: string;
}

export const preventiveMaintenanceAPI = {
  parseFile: async (file: File): Promise<ParseResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ParseResult>(
      '/preventive-maintenance/parse',
      formData
    );
    return data;
  },

  importPlans: async (rows: ParsedPmRow[]): Promise<ImportResult> => {
    const { data } = await apiClient.post<ImportResult>(
      '/preventive-maintenance/import',
      { rows }
    );
    return data;
  },

  listPlans: async () => {
    const { data } = await apiClient.get<{ plans: unknown[] }>(
      '/preventive-maintenance/plans'
    );
    return data.plans;
  },

  createWorkOrdersFromPlans: async (planIds: number[]): Promise<ImportResult> => {
    const { data } = await apiClient.post<ImportResult>(
      '/preventive-maintenance/create-work-orders',
      { planIds }
    );
    return data;
  },
};
