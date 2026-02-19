/**
 * QR API
 */

import { apiClient } from './client';

export interface GenerateQRRequest {
  workOrderId: number;
  /** Optional; backend derives from WO status */
  scanType?: 'CHECKIN' | 'CHECKOUT';
  /** Required for check-in QR only */
  techCountConfirmed?: number;
}

export interface GenerateQRResponse {
  qrToken: string;
  expirationTs: string;
  scanType: 'CHECKIN' | 'CHECKOUT';
}

export const qrAPI = {
  generate: async (request: GenerateQRRequest) => {
    const { data } = await apiClient.post<GenerateQRResponse>(
      '/qr/generate',
      request
    );
    return data;
  },
};
