# Section 18 — QR Code Lifecycle & Validation Logic

Implementation reference for QR scope, generation, refresh, invalidation, and check-in/check-out flows.

---

## 18.1 QR Scope

- **Per Work Order**, not per Ticket.
- Store Manager accesses QR via Ticket context; if Ticket has multiple WOs, SM must **select which Work Order** before generating QR.
- **Implementation:** `QRGenerationModal` receives `workOrders` for the ticket; dropdown when `workOrders.length > 1`. Backend `POST /qr/generate` takes `workOrderId`.

## 18.2 Trigger Condition for QR Availability

Store Manager can generate QR only when:

1. Work Order exists
2. Work Order has been accepted by vendor
3. Technician (S2) has been assigned by S1
4. Work Order owner is S2 (or in S2 execution lifecycle)

**Implementation:** Backend `qr-service.generateQR()` enforces: WO status in `ACCEPTED_TECHNICIAN_ASSIGNED` or `SERVICE_IN_PROGRESS`; `currentOwnerType === 'VENDOR'`; `assignedTechnicianId` set and role S2; `currentOwnerId === assignedTechnicianId`. Frontend lists WOs with these statuses for "QR Generation Required".

## 18.3 QR Generation Actor

- **Store Manager only.** Technician, Vendor, AMM cannot generate QR.
- **Implementation:** `requireRole(InternalRoles.STORE_MANAGER)` on `POST /qr/generate`; service throws if `actorRole !== STORE_MANAGER`.

## 18.4 QR Generation Preconditions

Before Store Manager can generate QR:

1. If multiple WOs: select vendor/work order from dropdown
2. Enter **number of technicians arrived** (mandatory); stored as "Declared Technician Count"

Then Generate QR button becomes active.

**Implementation:** Modal requires `selectedWorkOrderId` and `techCount >= 1`. Backend updates `WorkOrder.declaredTechCount` on generate and stores `techCountConfirmed` on `QRRecord`.

## 18.5 QR Refresh Rule

- QR **automatically refreshes every 5 minutes** (displayed QR changes; previous QR invalid).
- Refresh is automatic; Store Manager does not manually refresh.

**Implementation:** `QR_EXPIRATION_MINUTES=5`; each generated QR has `expirationTs = now + 5 min`. Frontend `QRGenerationModal` runs a 5-minute timer after a successful generate and re-calls `generate` with same `workOrderId` and `techCountConfirmed`, then updates the displayed QR.

## 18.6 QR Invalidation Rules

QR becomes invalid when:

- Successfully scanned (check-in or check-out)
- Replaced by refreshed code (new QR generated, old one expires in 5 min)
- Work Order state changes away from requiring scan

**Implementation:** `QRRecord.usedFlag` set on successful `validateQR`; `expirationTs` enforced in validation. Single-use per scan event; separate QR for check-in and check-out (scanType CHECKIN vs CHECKOUT).

## 18.7 Technician Check-In Flow

1. Technician opens WO detail → presses "Scan QR Code"
2. Pop-up: confirm number of technicians (Store Manager–entered number)
3. Technician confirms (read-only; cannot edit)
4. Camera / token entry → scan
5. System validates: QR belongs to this WO, QR still valid
6. If valid: check-in timestamp recorded, status → Service In Progress, ownership S2
7. If invalid: error, no check-in

**Implementation:** `CheckInModal` receives `declaredTechCount` from WO; shows count and "I confirm N technician(s) on site" checkbox; token input; `workOrdersAPI.checkIn(workOrderId, qrToken)`. Backend `validateQR` then state transition CHECKIN.

## 18.8 Technician Check-Out Flow

- Work report completed (mandatory), outcome selected (mandatory), comment if required, then QR scan.
1. Select outcome (Issue Fixed / Follow-Up / New WO Needed / Repair Unsuccessful)
2. Comment if required
3. Confirm technician count (read-only)
4. Scan QR → validity check
5. If valid: checkout timestamp, status/ownership per outcome
6. If invalid: error, no checkout

**Implementation:** `CheckOutModal` has outcome, comment, `declaredTechCount` confirmation, then token; `workOrdersAPI.checkOut(...)`. Backend validates QR scanType CHECKOUT.

## 18.9 Technician Count Confirmation Rule

- Declared count: required before QR generation (SM), confirmed by technician at check-in and again at check-out.
- Technician cannot edit; only confirm (evidence of workforce presence).

**Implementation:** WO `declaredTechCount` set at QR generation; CheckInModal and CheckOutModal show it read-only and require confirmation checkbox before enabling scan/submit.

## 18.10 Store Manager Responsibility

- SM generates QR and provides technician count. No workaround; WO cannot progress without check-in/out.

## 18.11 QR Visibility

- QR visible only to **Store Manager** (QR generation screen).
- Technician sees **Scan button and camera/token input**, not the QR image.

**Implementation:** QR generation UI only in Store Manager dashboard; S2 sees only scan/token input in modals.

## 18.12 QR Audit Log Requirements

System logs:

- QR generated timestamp, declared technician count → `AuditLog` actionType `QR_GENERATED`, comment `Declared technician count: N`
- QR scanned for check-in → `AuditLog` actionType `CHECKIN` (existing)
- QR scanned for check-out → state transition audit (existing)
- Invalid scan attempts: optional (currently not logged)

**Implementation:** `qr-service.generateQR` writes one `AuditLog` row. Check-in/check-out already write audit in work-order-service.
