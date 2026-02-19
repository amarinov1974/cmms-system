# Section 17 — Global Workflow State Machine (Ticket + Work Order)

This document is the **authoritative reference** for the CMMS workflow. Implementation lives in:

- `packages/backend/src/core/state-machine/ticket-state-machine.ts`
- `packages/backend/src/core/state-machine/work-order-state-machine.ts`
- `packages/backend/src/core/state-machine/index.ts` (validation engine)

---

## 17.1 Global Invariants (Absolute)

1. **At any moment**: Ticket has exactly one owner; Work Order has exactly one owner.
2. **No parallel approval** — all approval chains are sequential.
3. **No skipping approval roles** — AM → D → C2 → BOD when required by threshold.
4. **No modification of entity unless owner** — enforced via `requiresOwnership` and `validateOwnership`.
5. **Terminal states are irreversible** — no transitions defined from Rejected, Withdrawn, Archived (ticket); Cost Proposal Approved, Closed Without Cost, Work Order Rejected (WO).
6. **Urgency is an attribute, not a state** — routing (AMM vs AM) is determined by urgency; same status names.
7. **Ticket and Work Order lifecycles are independent but linked** — one ticket can have multiple WOs; ticket archived only when all WOs terminal.

---

## 17.2 Ticket State Machine (Implementation Map)

| Spec State | Owner | Transitions | Code (action → toStatus) |
|------------|--------|-------------|---------------------------|
| **Draft** | Creator | Submit → Ticket Submitted; Cancel → Discard | `DRAFT` + `SUBMIT` → `SUBMITTED`. (Cancel/Discard: not implemented; no Discard status.) |
| **Ticket Submitted** | AMM (urgent) / AM (non-urgent) | Urgent: Create WO, Request Clarification, Reject. Non-urgent: Approve for Estimation, Request Clarification, Reject | `REQUEST_CLARIFICATION` → `AWAITING_CREATOR_RESPONSE`; `REJECT` → `REJECTED`; `APPROVE_FOR_ESTIMATION` → `COST_ESTIMATION_NEEDED` (AM). Create WO is separate API, does not change ticket status. |
| **Awaiting Ticket Creator Response** | Store Manager | Submit Updated → Updated Submitted; Withdraw → Withdrawn | `SUBMIT_UPDATED` → `UPDATED_SUBMITTED`; `WITHDRAW` → `WITHDRAWN`. |
| **Updated Ticket Submitted** | AMM | Continue, Reject, Approve for Estimation, Create WO (urgent) | `REQUEST_CLARIFICATION`, `REJECT`, `APPROVE_FOR_ESTIMATION` → same as above. |
| **Cost Estimation Needed** | AMM | Request Approval → Cost Estimation Approval Needed; Request Clarification; Reject | `REQUEST_APPROVAL` → `COST_ESTIMATION_APPROVAL_NEEDED`; `REQUEST_CLARIFICATION`; `REJECT`. |
| **Cost Estimation Approval Needed** | AM then D then C2 then BOD (if >3000) | Approve → next or Approved; Return → Cost Estimation Needed; Reject | `APPROVE` → `COST_ESTIMATION_APPROVED` (final); `ESCALATE` (next approver); `RETURN` → `COST_ESTIMATION_NEEDED`; `REJECT` → `REJECTED`. |
| **Ticket Cost Estimation Approved** | AMM | Create Work Order; Archive when all WOs complete | `ARCHIVE` → `ARCHIVED`. Create WO is separate. |
| **Ticket Rejected / Withdrawn / Archived** | Terminal | — | No outgoing transitions. |

---

## 17.3 Work Order State Machine (Implementation Map)

| Spec State | Owner | Transitions | Code (action → toStatus) |
|------------|--------|-------------|---------------------------|
| **Work Order Created** | S1 | Assign Technician → Accepted/Technician Assigned; Return → AMM; Reject → WO Rejected | `ASSIGN_TECHNICIAN` → `ACCEPTED_TECHNICIAN_ASSIGNED`; `RETURN_FOR_CLARIFICATION` (owner→AMM, status stays CREATED); `REJECT` → `REJECTED`. |
| **Accepted / Technician Assigned** | S2 | QR Check-in → Service In Progress; Return to SM (correct tech count) | `CHECKIN` → `SERVICE_IN_PROGRESS`. `RETURN_FOR_TECH_COUNT` → same status, owner → SM (S2 cannot change technician count; can only confirm or return to store). |
| **Service In Progress** | S2 | Checkout with outcome | `CHECKOUT_FIXED`, `CHECKOUT_FOLLOW_UP`, `CHECKOUT_NEW_WO_NEEDED`, `CHECKOUT_UNSUCCESSFUL`. |
| **Checkout: Issue Fixed** | → S3 | Service Completed | `CHECKOUT_FIXED` → `SERVICE_COMPLETED`, owner S3. |
| **Checkout: Follow-Up** | → S2 | Follow-Up Visit Requested | `CHECKOUT_FOLLOW_UP` → `FOLLOW_UP_REQUESTED`, owner S2. |
| **Checkout: New WO Needed / Unsuccessful** | → AMM | New Work Order Needed / Repair Unsuccessful | `CHECKOUT_NEW_WO_NEEDED` / `CHECKOUT_UNSUCCESSFUL` → owner AMM. |
| **Service Completed** | S3 | Send Cost Proposal → Cost Proposal Prepared | `SUBMIT_COST_PROPOSAL` → `COST_PROPOSAL_PREPARED`, owner AMM. |
| **Cost Proposal Prepared** | AMM | Approve → Approved; Request Revision → Cost Revision Requested; Close Without Cost | `APPROVE_COST` → `COST_PROPOSAL_APPROVED`; `REQUEST_REVISION` → `COST_REVISION_REQUESTED` (owner S3); `CLOSE_WITHOUT_COST` → `CLOSED_WITHOUT_COST`. |
| **Cost Revision Requested** | S3 | Resubmit → Cost Proposal Prepared | `RESUBMIT_COST_PROPOSAL` → `COST_PROPOSAL_PREPARED`, owner AMM. |
| **Cost Proposal Approved / Closed Without Cost / WO Rejected** | Terminal or AMM (Rejected) | — | No transitions out. Rejected owner = AMM (can create new WO from ticket). |

---

## 17.4 Ticket–Work Order Interaction Rules

1. One ticket may create **multiple** work orders.
2. Ticket remains active until **all** work orders are terminal.
3. Ticket is **archived** only when: all WOs in terminal state (Cost Proposal Approved, Closed Without Cost, Rejected) **or** ticket rejected/withdrawn. Implemented in `ticket-service.archiveTicket()` (checks all WOs terminal).

---

## 17.5 Forbidden Transitions (Enforcement)

| Forbidden | How enforced |
|-----------|----------------|
| Ticket Submitted → Approved without approval chain | No single transition to COST_ESTIMATION_APPROVED from SUBMITTED; must go via COST_ESTIMATION_NEEDED → APPROVAL_NEEDED → APPROVE. |
| Cost Proposal Approved → Revision | No transition from COST_PROPOSAL_APPROVED in work-order-state-machine. |
| Technician checkout without report completion | Frontend blocks checkout until report completed (Section 14); backend accepts workReport. |
| AMM modifying S3 cost table | AMM WO detail is read-only for invoice (Section 16). |
| S3 modifying S2 work report | S3 sees work report read-only; no edit API. |
| Skipping AM in approval | Approval chain starts with AM (`newOwnerRole: AREA_MANAGER` from COST_ESTIMATION_NEEDED). |
| Skipping BOD when >3000 | `approval-chain-service.getRequiredApprovers(amount)` returns BOD for amount > 3000; sequential flow. |

---

## 17.6 Ownership Matrix

**Ticket owners:** Store Manager, AM, AMM, D, C2, BOD, System (null when archived).

**Work Order owners:** S1, S2, S3, AMM, System. No shared ownership; one owner per entity at any time.

---

## Implementation Notes

- **Approval chain order** (cost estimation): AM → D → C2 → BOD. Resolved in `approval-chain-service` and ticket/wo services by setting `currentOwnerId` to the next approver’s user id.
- **Terminal states** are defined in `types/statuses.ts` (`TerminalTicketStatuses`, `TerminalWorkOrderStatuses`).
- **Urgency** is stored on the ticket; routing to AMM vs AM on submit is determined by business logic (e.g. who is set as initial owner), not by a separate status.
