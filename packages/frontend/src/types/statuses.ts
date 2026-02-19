/**
 * LOCKED STATUS DEFINITIONS
 * DO NOT RENAME, MERGE, OR MODIFY
 * These match the functional specification state machines exactly
 */

export const TicketStatus = {
  DRAFT: 'Draft',
  SUBMITTED: 'Ticket Submitted',
  AWAITING_CREATOR_RESPONSE: 'Awaiting Ticket Creator Response',
  UPDATED_SUBMITTED: 'Updated Ticket Submitted',
  COST_ESTIMATION_NEEDED: 'Cost Estimation Needed',
  COST_ESTIMATION_APPROVAL_NEEDED: 'Cost Estimation Approval Needed',
  COST_ESTIMATION_APPROVED: 'Ticket Cost Estimation Approved',
  WORK_ORDER_IN_PROGRESS: 'Work Order In Progress',
  REJECTED: 'Ticket Rejected',
  WITHDRAWN: 'Ticket Withdrawn',
  ARCHIVED: 'Ticket Archived',
} as const;

export const WorkOrderStatus = {
  CREATED: 'Awaiting Service Provider',
  ACCEPTED_TECHNICIAN_ASSIGNED: 'Service Visit Scheduled',
  SERVICE_IN_PROGRESS: 'Service In Progress',
  SERVICE_COMPLETED: 'Service Completed',
  FOLLOW_UP_REQUESTED: 'Follow-Up Visit Requested',
  NEW_WO_NEEDED: 'New Work Order Needed',
  REPAIR_UNSUCCESSFUL: 'Repair Unsuccessful',
  COST_PROPOSAL_PREPARED: 'Cost Proposal Prepared',
  COST_REVISION_REQUESTED: 'Cost Revision Requested',
  COST_PROPOSAL_APPROVED: 'Cost Proposal Approved',
  CLOSED_WITHOUT_COST: 'Closed Without Cost',
  REJECTED: 'Work Order Rejected',
} as const;

export type TicketStatusType = (typeof TicketStatus)[keyof typeof TicketStatus];
export type WorkOrderStatusType = (typeof WorkOrderStatus)[keyof typeof WorkOrderStatus];

// Terminal states (typed as readonly string[] so .includes(apiString) is valid when API returns currentStatus: string)
export const TerminalTicketStatuses: readonly string[] = [
  TicketStatus.REJECTED,
  TicketStatus.WITHDRAWN,
  TicketStatus.ARCHIVED,
];

export const TerminalWorkOrderStatuses: readonly string[] = [
  WorkOrderStatus.COST_PROPOSAL_APPROVED,
  WorkOrderStatus.CLOSED_WITHOUT_COST,
  WorkOrderStatus.REJECTED,
];
