# CMMS Functional Specification

This document is a placeholder for the original functional specification.

Copy the full functional spec content here. The project foundation implements:

- **Ticket** and **Work Order** as distinct concepts with separate state machines
- **Locked statuses and roles** as defined in `packages/backend/src/types/statuses.ts` and `roles.ts`
- **Approval chains** and **ownership validation** (to be implemented per spec)
- **QR-based physical presence** validation (to be implemented per spec)

Do not simplify, merge, or rename any statuses, roles, or workflow steps.
