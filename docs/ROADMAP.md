# Roadmap

Each phase requires user verification and explicit approval before the next begins.

Current delivery update (2026-10-16): Phases 0–10 and the UI/UX redesign are implemented. The owner confirms the Render demo is live from commit `7edfe2183d0502f55a343056f3d34c45bbe3b716`. One real synthetic-only grounded AMD Token Factory request is verified in `docs/evidence/amd-token-factory-verified-2026-10-16.json`; the public Render demo remains deterministic. Final public workflow UAT, video, pitch deck, cover image and authenticated submission remain outstanding. Older phase notes below preserve the evidence boundary at the time each phase closed.

## Phase 0 — Foundation (complete)

Protected source snapshot, evidence-bounded requirements, architecture/docs, environment contract, health endpoint, synthetic fixture, smoke tests, and CI baseline.

## Phase 1 — Data and eligibility contract (complete)

- Completed: read-only adapter contract and Prisma implementation over existing employee, availability, leave, and shift data.
- Completed: synthetic Liam/Noah/Olivia tests plus inactive, unavailable, role, hours, zero-candidate, invalid-shift, and tie-breaking coverage.
- Completed: deterministic blockers, reasons, configurable role/weekly-minute policy, and stable ranking.
- Excluded: persistence mutation, AI explanation, proposal workflow, API, and UI.

## Phase 2 — Proposal workflow (complete)

- Completed: incident and proposal persistence, stable state transitions, Manager-only API, approval/rejection, apply-time eligibility revalidation, optimistic concurrency, stale detection, atomic schedule mutation, and audit records.
- Completed: service/route tests and an opt-in PostgreSQL transaction integration test.
- Excluded: AI explanation provider, UI, notifications, deployment, and partner integrations.

## Phase 3 — Grounded explanation provider (complete)

- Completed: deterministic explanations, OpenAI-compatible HTTP adapter, structured candidate-ID validation, timeout/error handling, output limits, and deterministic fallback.
- Completed: proposal creation uses only already-validated candidate facts.
- Not verified: real AMD Developer Cloud/vLLM endpoint, AMD hardware execution, model identity, latency, or Evolus.
- Excluded: UI, deployment, and partner integration.

## Phase 4 — Minimal Manager UI and end-to-end demo (complete)

- Completed: protected manager route, incident creation, incident-scoped candidate evaluation, eligible/blocked comparison, proposal creation, explicit approval, apply, and audit display.
- Completed: backend service/route coverage plus a browser-component workflow test.
- Excluded: automatic actions, richer shift picker, notifications, deployment, verified partner integration, and submission packaging.

## Phase 5 — Submission readiness and evidence gate (complete within its scoped deliverables)

- Completed: refreshed public-requirement audit, public-repository verification, submission draft, checklist, five-minute demo script, runtime evidence template, and secret-safe readiness checker.
- BLOCKED: authenticated enrollment state, license compatibility, deployed application, video, deck, real AMD inference evidence, and any optional Evolus eligibility. The deadline is user-confirmed as 18 October 2026 at 9:00 PM AEDT from an authenticated screenshot that Codex did not independently inspect.
- No real AMD/Evolus API call was made and no compliance claim is implied.

## Phase 6 — Audit hardening (complete within its scoped deliverables)

- Completed: CI branch coverage, strict business-time handling, constrained explanations, exhaustive proposal error mapping, reject UI, evidence-aware readiness checks, transaction-scoped proposal revalidation, provenance evidence, and bounded npm audit remediation.
- Verified in GitHub CI with PostgreSQL: backend 81/81, frontend 17/17, readiness 4/4, plus lint, typecheck, and build.
- PARTIAL: ordinary shift create/update does not yet validate and persist inside the shared employee lock protocol.
- Complete handoff: `docs/OPEN_ISSUES_HANDOFF.md`.

## Phase 7 — AMD Token Factory adapter (merged; one later live request verified)

- Implemented: explicit AMD provider configuration, fixed official Token Factory base URL, strict response schema/model/grounding validation, safe provenance, visible source labels, deterministic fallback, and a synthetic live-evidence command.
- Verified: focused tests, full local non-database regression, lint, typecheck, build, and PR CI including PostgreSQL passed for commit `43e2359`.
- Later evidence: one real grounded request completed with configured model `MiniCPM5-2B`, provider-returned identifier `self-dploy/MiniCPM5-2B`, 3305 ms latency and no deterministic fallback. See the committed sanitized evidence record.
- Boundary: this request does not prove AMD use in the public deterministic Render demo or general account/hardware compliance.

## Phase 8 — Scheduling-write serialization (merged)

- Implemented: ordinary shift create/update/reassignment/unassignment/cancel use transaction-scoped validation, deterministic employee lock ordering, Serializable retry, and stable concurrency errors.
- Verified locally: focused unit/route/transaction tests, lint, typecheck, production build, 88/88 backend tests with PostgreSQL enabled, and 17/17 frontend tests.
- PostgreSQL evidence: the six-case matrix covers proposal apply, ordinary create/reassignment, availability reduction, and leave approval; it passed five consecutive runs and every conflict allowed only one incompatible mutation to commit.
- Delivery state: implementation and the follow-up leave-review atomicity remediation are merged; deployment and production-load evidence remain unavailable.

## Phase 9 — Reproducible competition demo evidence (merged; evidence local)

- Implemented: a self-cleaning, synthetic PostgreSQL scenario for incident creation, deterministic eligibility, proposal creation, Manager approval, atomic apply, audit verification, and backend-derived before/after staffing-gap evidence.
- Evidence boundary: the command explicitly records deterministic explanation mode and `amdRuntimeEvidence: false`; it cannot satisfy the AMD, browser, deployment, or production gates.
- Verified locally: the PostgreSQL scenario completed with one eligible and one role-blocked candidate, reduced unfilled shifts from 1 to 0, reached `APPLIED`, produced all four expected audit actions, and removed its synthetic records.

## Phase 10 — Local browser demo evidence (merged; evidence local)

- Completed: the rendered Manager UI was exercised against the real local Express API and PostgreSQL database from login through shift creation, incident evaluation, proposal creation, explicit approval, atomic apply, and audit display.
- Verified: one eligible and two blocked candidates were displayed, the proposal reached `APPLIED`, all four expected audit actions were visible, PostgreSQL recorded `SCHEDULED`/`APPLIED`/`RESOLVED`, and the temporary synthetic records were removed.
- Evidence boundary: the UI displayed `[Source: deterministic]`; this is not AMD runtime or public-deployment evidence.

## Remaining submission work

- Reconcile final AMD claims with the verified request while stating that the public demo is deterministic.
- Select and implement the optional Evolus track only with an event workspace and explicit track decision.
- Complete public workflow UAT, video, pitch deck, cover image and owner-controlled submission.
