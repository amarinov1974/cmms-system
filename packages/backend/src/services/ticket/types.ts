/**
 * Ticket Service Types
 */

import type { TicketCategory } from '@prisma/client';
import type { TicketStatusType } from '../../types/statuses.js';

export interface CreateTicketRequest {
  storeId: number;
  category: TicketCategory;
  description: string;
  urgent: boolean;
  assetId?: number;
}

export interface UpdateTicketRequest {
  description?: string;
  category?: TicketCategory;
  assetId?: number;
}

export interface SubmitTicketRequest {
  ticketId: number;
}

export interface RequestClarificationRequest {
  ticketId: number;
  comment: string;
  /** Internal role code to send the ticket to (e.g. SM, AM, AMM). Defaults to SM (creator) if omitted. */
  assignToRole?: string;
}

export interface SubmitUpdatedTicketRequest {
  ticketId: number;
  updatedDescription?: string;
  comment?: string;
  assetId?: number; // Optional: add asset link in clarification mode if not already linked
}

export interface RejectTicketRequest {
  ticketId: number;
  reason: string;
}

export interface WithdrawTicketRequest {
  ticketId: number;
  reason?: string;
}

export interface AddCommentRequest {
  ticketId: number;
  text: string;
  internalFlag?: boolean;
}

export interface ListTicketsQuery {
  status?: TicketStatusType;
  urgent?: boolean;
  storeId?: number;
  regionId?: number;
  createdByUserId?: number;
  currentOwnerUserId?: number;
  /** Tickets the user participated in (creator or audit actor) but is not current owner */
  participatedByUserId?: number;
  limit?: number;
  offset?: number;
}

export interface TicketResponse {
  id: number;
  storeId: number;
  storeName: string;
  createdByUserId: number;
  createdByUserName: string;
  category: TicketCategory;
  description: string;
  /** Original description at ticket creation (for previews); falls back to description if not set */
  originalDescription?: string | null;
  urgent: boolean;
  currentStatus: TicketStatusType;
  currentOwnerUserId: number | null;
  currentOwnerUserName: string | null;
  assetId?: number | null;
  assetDescription?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketDetailResponse extends TicketResponse {
  createdByUserRole?: string | null;
  currentOwnerUserRole?: string | null;
  /** When status is Awaiting Creator Response: who requested clarification (assignee can only return to this role) */
  clarificationRequestedByUserId?: number | null;
  clarificationRequestedByUserName?: string | null;
  clarificationRequestedByUserRole?: string | null;
  /** Internal role codes (SM, AM, AMM, D, C2, BOD) that have participated in the ticket life; for clarification dropdown */
  involvedInternalRoles?: string[];
  submittedAt?: Date | null;
  originalDescription?: string | null;
  comments: CommentResponse[];
  auditLog: AuditLogResponse[];
  attachments?: AttachmentResponse[];
  costEstimation?: {
    ticketId: number;
    estimatedAmount: number;
    createdByUserId: number;
    createdByUserName: string;
    createdAt: Date;
  };
  approvalRecords?: ApprovalRecordResponse[];
}

export interface AttachmentResponse {
  id: number;
  fileName: string;
  createdAt: Date;
  internalFlag: boolean;
}

export interface CommentResponse {
  id: number;
  authorUserId: number;
  authorUserName: string;
  text: string;
  internalFlag: boolean;
  createdAt: Date;
}

export interface AuditLogResponse {
  id: number;
  prevStatus: string | null;
  newStatus: string;
  actionType: string;
  actorId: number;
  actorName: string;
  actorRole?: string | null;
  comment: string | null;
  createdAt: Date;
}

export interface SubmitCostEstimationRequest {
  ticketId: number;
  estimatedAmount: number;
}

export interface ApproveCostEstimationRequest {
  ticketId: number;
  comment?: string;
}

export interface ReturnCostEstimationRequest {
  ticketId: number;
  comment: string;
}

export interface CreateWorkOrderRequest {
  ticketId: number;
  vendorCompanyId: number;
  description?: string;
}

export interface ArchiveTicketRequest {
  ticketId: number;
}

export interface CostEstimationResponse {
  ticketId: number;
  estimatedAmount: number;
  createdByUserId: number;
  createdByUserName: string;
  createdAt: Date;
  approvalChain: ApprovalRecordResponse[];
}

export interface ApprovalRecordResponse {
  id: number;
  approverUserId: number;
  approverUserName: string;
  role: string;
  decision: 'APPROVED' | 'RETURNED' | 'REJECTED';
  comment: string | null;
  createdAt: Date;
}
