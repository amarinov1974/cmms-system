/**
 * S2 work order draft — persist work report and checkout form when leaving screen.
 */

import type { WorkReportRow } from '../../../api/work-orders';

const KEY_PREFIX = 's2-wo-draft-';

export interface S2WODraft {
  workReport?: WorkReportRow[];
  reportCompleted?: boolean;
  outcome?: 'FIXED' | 'FOLLOW_UP' | 'NEW_WO_NEEDED' | 'UNSUCCESSFUL';
  comment?: string;
  qrToken?: string;
}

export function getS2WODraft(workOrderId: number): S2WODraft | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + workOrderId);
    if (raw == null) return null;
    return JSON.parse(raw) as S2WODraft;
  } catch {
    return null;
  }
}

export function setS2WODraft(workOrderId: number, data: Partial<S2WODraft>): void {
  try {
    const existing = getS2WODraft(workOrderId) ?? {};
    const merged = { ...existing, ...data };
    localStorage.setItem(KEY_PREFIX + workOrderId, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

export function clearS2WODraft(workOrderId: number): void {
  try {
    localStorage.removeItem(KEY_PREFIX + workOrderId);
  } catch {
    // ignore
  }
}
