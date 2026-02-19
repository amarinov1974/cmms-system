/**
 * S3 work order draft — persist invoice proposal rows when leaving the work order detail screen.
 */

export interface S3InvoiceRowDraft {
  description: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
  priceListItemId?: number;
  isFromPriceList: boolean;
  isNotInPricelist?: boolean;
}

export interface S3WODraft {
  invoiceRows?: S3InvoiceRowDraft[];
}

const KEY_PREFIX = 's3-wo-draft-';

export function getS3WODraft(workOrderId: number): S3WODraft | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + workOrderId);
    if (raw == null) return null;
    return JSON.parse(raw) as S3WODraft;
  } catch {
    return null;
  }
}

export function setS3WODraft(workOrderId: number, data: Partial<S3WODraft>): void {
  try {
    const existing = getS3WODraft(workOrderId) ?? {};
    const merged = { ...existing, ...data };
    localStorage.setItem(KEY_PREFIX + workOrderId, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

export function clearS3WODraft(workOrderId: number): void {
  try {
    localStorage.removeItem(KEY_PREFIX + workOrderId);
  } catch {
    // ignore
  }
}
