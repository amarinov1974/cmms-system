/**
 * Simple tests for state machine validation.
 * Run: npx tsx src/core/state-machine/test-transitions.ts
 */

import { validateTransition } from './index.js';
import { TicketStatus } from '../../types/statuses.js';
import { InternalRoles } from '../../types/roles.js';

async function runTests() {
  // Test 1: Valid transition
  const validTest = await validateTransition({
    entityType: 'TICKET',
    entityId: 1,
    currentStatus: TicketStatus.DRAFT,
    currentOwnerId: 100,
    action: 'SUBMIT',
    actorId: 100,
    actorRole: InternalRoles.STORE_MANAGER,
  });

  console.log('Valid transition:', validTest);
  // Expected: { allowed: true, newStatus: 'Ticket Submitted' }

  // Test 2: Invalid - not owner
  const invalidOwner = await validateTransition({
    entityType: 'TICKET',
    entityId: 1,
    currentStatus: TicketStatus.DRAFT,
    currentOwnerId: 100,
    action: 'SUBMIT',
    actorId: 999,
    actorRole: InternalRoles.STORE_MANAGER,
  });

  console.log('Invalid owner:', invalidOwner);
  // Expected: { allowed: false, error: '...', errorCode: 'NOT_OWNER' }

  // Test 3: Invalid - wrong role (SM cannot APPROVE cost estimation)
  const invalidRole = await validateTransition({
    entityType: 'TICKET',
    entityId: 1,
    currentStatus: TicketStatus.COST_ESTIMATION_APPROVAL_NEEDED,
    currentOwnerId: 200,
    action: 'APPROVE',
    actorId: 200,
    actorRole: InternalRoles.STORE_MANAGER,
  });

  console.log('Invalid role:', invalidRole);
  // Expected: { allowed: false, error: '...', errorCode: 'ROLE_NOT_ALLOWED' }
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
