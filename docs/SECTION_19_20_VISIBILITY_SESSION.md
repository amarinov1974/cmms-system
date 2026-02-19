# Section 19 — Internal vs External Comments & Attachment Sharing

# Section 20 — Session, Timeout & Data Safety

---

## Section 19 Summary

- **Two comment layers:** Ticket Phase (internal only) vs Work Order Phase (shared with vendor). Never mixed.
- **Ticket Phase:** Only internal roles see ticket comments, cost estimation, approval chain. Vendor (S1, S2, S3) must NOT see these.
- **Work Order Phase:** Vendor sees ticket core data (limited), category, urgency, AMM message, forwarded attachments, asset. Vendor does NOT see internal ticket comments or approval details.
- **Attachments:** Internal vs shared flags; AMM chooses which to forward when creating WO. Backend must enforce visibility.
- **Cost proposal:** Visible to S3 and AMM only; not Store Manager, AM, D, C2, BOD.
- **History:** Ticket history internal only; WO history visible to vendor + AMM; no cross-contamination.

**Implementation notes:**

- `TicketComment.internalFlag` and `Attachment.internalFlag` exist in schema. Ticket detail API returns comments/attachments to caller; **visibility must be enforced by role** (internal vs vendor). When a vendor calls any ticket API, do not return ticket comments or internal attachments. When AMM creates WO, attachment forwarding is explicit (shared attachments linked to WO).
- Backend: filter ticket comments and ticket attachments by caller role (internal vs vendor). WO comments and WO attachments visible to vendor and AMM. Cost proposal (invoice) only in WO context; S3/AMM only.

---

## Section 20 Summary

- **20.1 Global session timeout:** Inactive 10 minutes → auto logout, redirect to Entry. (Implementation: session timeout in session manager; frontend can implement inactivity timer and redirect.)
- **20.2 Timeout during drafts:** No workflow state change; draft save or lose (implementation choice).
- **20.3 Timeout during S2 execution:** WO stays Service In Progress; check-in valid; work report saved; no automatic checkout.
- **20.4 Timeout during QR generation:** QR lifecycle tied to WO; session expiry does not invalidate QR.
- **20.5 Network:** No check-in/check-out/cost submit without server confirmation; retry on failure.
- **20.6 Concurrency:** Only owner can modify; others read-only; on ownership change show "Ownership has changed" and refresh.
- **20.7 Confirmation dialogs:** Reject Ticket, Reject WO, Withdraw, Close Without Cost, Submit Cost Proposal.
- **20.8 Atomic state transitions:** Backend uses transactions; no partial state.
- **20.9 Double submission:** Disable submit button and wait for confirmation (frontend).
- **20.10 Audit:** All transitions, actor, timestamp, previous/new state; immutable logs.
- **20.11 No silent overrides:** No auto-close, auto-approve, auto-skip, auto-generate.
- **20.12 Refresh:** Reload entity from server; no duplicate actions.

**Implementation:** Backend already uses transactions and audit logs. Frontend should add inactivity timeout (e.g. 10 min), confirmation dialogs for critical actions, and disable-submit-while-pending where applicable.
