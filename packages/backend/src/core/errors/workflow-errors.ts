/**
 * Custom workflow errors - do not simplify approval or validation logic.
 */

export class WorkflowError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'WorkflowError';
    Object.setPrototypeOf(this, WorkflowError.prototype);
  }
}

export class InvalidTransitionError extends WorkflowError {
  constructor(from: string, to: string) {
    super(`Invalid state transition: ${from} -> ${to}`, 'INVALID_TRANSITION', 400);
    this.name = 'InvalidTransitionError';
  }
}

export class UnauthorizedActionError extends WorkflowError {
  constructor(action: string) {
    super(`Unauthorized: ${action}`, 'UNAUTHORIZED', 403);
    this.name = 'UnauthorizedActionError';
  }
}

export class OwnershipValidationError extends WorkflowError {
  constructor(resource: string) {
    super(`Ownership validation failed for: ${resource}`, 'OWNERSHIP_FAILED', 403);
    this.name = 'OwnershipValidationError';
  }
}
