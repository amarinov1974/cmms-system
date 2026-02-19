# Section 21 — Conceptual Data Model (Required Database Entities)

# Section 22 — Non-Goals & System Boundaries

# Section 23 — Architecture Constraints for Claude

---

## Section 21 — Mapping to Schema

The conceptual model (Section 21) is implemented in `packages/backend/prisma/schema.prisma`:

| Conceptual Entity       | Prisma Model / Notes |
|-------------------------|----------------------|
| Company                 | `Company` |
| Vendor Company          | `VendorCompany` |
| Region                  | `Region` |
| Store                   | `Store` |
| User (Internal)         | `InternalUser` (role, companyId, regionId, storeId) |
| Vendor User             | `VendorUser` (role S1/S2/S3) |
| Ticket                  | `Ticket` (currentStatus, currentOwnerUserId, etc.) |
| Work Order              | `WorkOrder` (checkinTs, checkoutTs, declaredTechCount, etc.) |
| Asset                   | `Asset` |
| Ticket Comment          | `TicketComment` (internalFlag) |
| Work Order Comment      | `WOComment` |
| Attachment              | `Attachment` (entityType, entityId, internalFlag) |
| Cost Estimation         | `CostEstimation` |
| Approval Record         | `ApprovalRecord` |
| Work Report Row         | `WorkReportRow` |
| Invoice Proposal Row    | `InvoiceRow` (warningFlag) |
| Vendor Price List       | `VendorPriceListItem` |
| **QR Record**           | `QRRecord` (woId, qrToken, scanType, generatedTs, expirationTs, usedFlag, techCountConfirmed) |
| Audit Log               | `AuditLog` (immutable) |

Indexes: ticket by status+owner, WO by status+owner, approval by ticketId, price list by vendor+category, qr_records by qrToken and woId.

---

## Section 22 — Non-Goals (Binding)

The system must NOT:

- Automatically approve, escalate, assign, close, or generate (all transitions explicit).
- Use parallel approval (strictly sequential).
- Enforce SLA/ETA automatically (ETA declarative only).
- Manage inventory, financial accounting, or asset lifecycle.
- Allow direct Store–Vendor communication (all via AMM).
- Allow multiple vendors per single WO, or multiple technician assignments (one S2 per WO; count declared separately).
- Allow retroactive editing of report, cost proposal, estimation, or logs.
- Allow state bypass (no skip of estimation, assignment, QR check-in/out, cost proposal).
- Rely on UI-only security (backend enforces ownership and visibility).
- Phase 1: no real authentication, no reporting module, no payment, single currency (EUR).

**Implementation:** Backend state machine and role checks enforce these; no automatic transitions; no hidden flows.

---

## Section 23 — Architecture Constraints

- **State-driven:** All transitions explicit, validated, deterministic (state machine).
- **Ownership-enforced:** Single owner per entity; backend validation on every action.
- **Immutable audit trail:** Every transition recorded; append-only logs.
- **Separation of concerns:** Ticket, Work Order, Approval, Cost, QR, User domains separated.
- **Visibility at backend:** Role-based visibility enforced in API layer, not only UI.
- **Transactional state changes:** Atomic; no partial transitions.

**Required modules:** Auth/Session, Role & Permission, Ticket, Work Order, Approval, Cost Estimation, Cost Proposal, QR, Audit Log, Attachment Storage. Each with clear boundaries and APIs.

**Forbidden:** Combine Ticket and WO into one table; replace approval chain with generic table; remove status granularity; auto-archive; collapse comment layers; merge S2/S3; replace QR with simple timestamp.

**QR architecture:** Unique time-bound tokens; validate against WO; invalidate after use; 5-min refresh; log scan events.

**Cursor/implementation:** Prompts must be screen- and action-specific with clear state and validation rules.
