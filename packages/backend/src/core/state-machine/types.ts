/**
 * State Machine Types
 * Core types for state transition validation
 */

import type { InternalRole, VendorRole } from '../../types/roles.js';
import type { TicketStatusType, WorkOrderStatusType } from '../../types/statuses.js';

export type Role = InternalRole | VendorRole;

export interface TransitionRequest {
  entityType: 'TICKET' | 'WORK_ORDER';
  entityId: number;
  currentStatus: TicketStatusType | WorkOrderStatusType;
  currentOwnerId: number | null;
  currentOwnerType?: 'INTERNAL' | 'VENDOR'; // For work orders
  action: string;
  actorId: number;
  actorRole: Role;
  additionalData?: Record<string, unknown>;
}

export interface TransitionResult {
  allowed: boolean;
  newStatus?: TicketStatusType | WorkOrderStatusType;
  newOwnerId?: number | null;
  newOwnerType?: 'INTERNAL' | 'VENDOR';
  error?: string;
  errorCode?: string;
}

export interface StateTransition {
  fromStatus: TicketStatusType | WorkOrderStatusType;
  action: string;
  allowedRoles: Role[];
  toStatus: TicketStatusType | WorkOrderStatusType;
  requiresOwnership: boolean;
  newOwnerRole?: Role; // Role of the new owner after transition
  validator?: (request: TransitionRequest) => Promise<ValidationResult>;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: string;
}

export interface OwnershipCheck {
  isOwner: boolean;
  error?: string;
}
