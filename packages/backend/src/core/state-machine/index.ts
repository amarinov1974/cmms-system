/**
 * State Machine Engine
 * Central validation point for all state transitions
 */

import type {
  TransitionRequest,
  TransitionResult,
  OwnershipCheck,
  StateTransition,
  Role,
} from './types.js';
import * as TicketStateMachine from './ticket-state-machine.js';
import * as WorkOrderStateMachine from './work-order-state-machine.js';

/**
 * Validate and execute a state transition
 * This is the ONLY entry point for state changes
 */
export async function validateTransition(
  request: TransitionRequest
): Promise<TransitionResult> {
  const transition = findTransition(request);

  if (!transition) {
    return {
      allowed: false,
      error: `Invalid transition: ${request.action} from ${request.currentStatus}`,
      errorCode: 'INVALID_TRANSITION',
    };
  }

  const actorRole = String(request.actorRole ?? '').trim().toUpperCase();
  const allowed = transition.allowedRoles.some(
    (r) => String(r).trim().toUpperCase() === actorRole
  );
  if (!allowed) {
    return {
      allowed: false,
      error: `Role ${request.actorRole} not allowed to perform ${request.action}`,
      errorCode: 'ROLE_NOT_ALLOWED',
    };
  }

  if (transition.requiresOwnership) {
    const ownershipCheck = validateOwnership(request);
    if (!ownershipCheck.isOwner) {
      return {
        allowed: false,
        error: ownershipCheck.error ?? 'Actor is not the current owner',
        errorCode: 'NOT_OWNER',
      };
    }
  }

  if (transition.validator) {
    const validationResult = await transition.validator(request);
    if (!validationResult.valid) {
      return {
        allowed: false,
        error: validationResult.error,
        errorCode: validationResult.errorCode,
      };
    }
  }

  const newOwnerType =
    request.entityType === 'WORK_ORDER' && transition.newOwnerRole
      ? (transition.newOwnerRole.startsWith('S') ? 'VENDOR' : 'INTERNAL')
      : undefined;

  return {
    allowed: true,
    newStatus: transition.toStatus,
    newOwnerType,
  };
}

/**
 * Find transition definition
 */
function findTransition(request: TransitionRequest): StateTransition | undefined {
  if (request.entityType === 'TICKET') {
    return TicketStateMachine.findTransition(
      request.currentStatus,
      request.action
    );
  }
  return WorkOrderStateMachine.findTransition(
    request.currentStatus,
    request.action
  );
}

/**
 * Validate ownership
 * Coerce to number so session/DB type mismatches (e.g. string vs number) don't block valid owners.
 */
function validateOwnership(request: TransitionRequest): OwnershipCheck {
  if (request.currentOwnerId === null || request.currentOwnerId === undefined) {
    return {
      isOwner: false,
      error: 'Entity has no owner (archived or system state)',
    };
  }

  const actorId = Number(request.actorId);
  const ownerId = Number(request.currentOwnerId);
  if (Number.isNaN(actorId) || Number.isNaN(ownerId) || actorId !== ownerId) {
    return {
      isOwner: false,
      error: `Actor ${request.actorId} is not the owner ${request.currentOwnerId}`,
    };
  }

  return { isOwner: true };
}

/**
 * Get all valid actions from current status for a given role
 */
export function getValidActions(
  entityType: 'TICKET' | 'WORK_ORDER',
  currentStatus: string,
  actorRole: Role
): string[] {
  const transitions =
    entityType === 'TICKET'
      ? TicketStateMachine.getValidTransitionsForStatus(currentStatus)
      : WorkOrderStateMachine.getValidTransitionsForStatus(currentStatus);

  return transitions
    .filter((t) => t.allowedRoles.includes(actorRole))
    .map((t) => t.action);
}

export * from './types.js';
export { TicketStateMachine, WorkOrderStateMachine };
