/**
 * Invoice Batches API — create batch from approved cost proposals, download recap PDF.
 */

import { apiClient } from './client';

export interface CreateBatchResponse {
  batch: {
    id: number;
    batchNumber: string;
    vendorCompanyId: number;
    createdById: number;
    createdAt: string;
    totalAmount: number;
    currency: string;
    status: string;
    itemCount: number;
    pdfUrl: string;
  };
  pdfUrl: string;
}

export const invoiceBatchesAPI = {
  create(workOrderIds: number[]): Promise<CreateBatchResponse> {
    return apiClient
      .post<CreateBatchResponse>('/invoice-batches', { workOrderIds })
      .then((res) => res.data);
  },

  /** Returns URL path to download PDF (same origin). Open in new tab or use as download link. */
  getPdfUrl(batchId: number): string {
    const base = apiClient.defaults.baseURL ?? '';
    return `${base}/invoice-batches/${batchId}/pdf`;
  },
};
