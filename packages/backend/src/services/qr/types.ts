/**
 * QR Service Types
 */

export interface GenerateQRRequest {
  workOrderId: number;
  /** Optional; backend derives from WO status (Accepted→CHECKIN, ServiceInProgress→CHECKOUT) */
  scanType?: 'CHECKIN' | 'CHECKOUT';
  /** Required for check-in QR only; not used for check-out */
  techCountConfirmed?: number;
}

export interface GenerateQRResponse {
  qrToken: string;
  expirationTs: Date;
  scanType: 'CHECKIN' | 'CHECKOUT';
}

export interface ValidateQRRequest {
  qrToken: string;
  workOrderId: number;
}

export interface ValidateQRResponse {
  valid: boolean;
  error?: string;
  scanType?: 'CHECKIN' | 'CHECKOUT';
  techCountConfirmed?: number;
}
