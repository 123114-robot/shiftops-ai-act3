# Roadmap

Each phase requires user verification and explicit approval before the next begins.

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
- BLOCKED: authenticated enrollment/deadline confirmation, license compatibility, deployed application, video, deck, real AMD inference evidence, and any optional Evolus eligibility.
- No real AMD/Evolus API call was made and no compliance claim is implied.

## Phase 6 — Audit hardening (complete within its scoped deliverables)

- Completed: CI branch coverage, strict business-time handling, constrained explanations, exhaustive proposal error mapping, reject UI, evidence-aware readiness checks, transaction-scoped proposal revalidation, provenance evidence, and bounded npm audit remediation.
- Verified in GitHub CI with PostgreSQL: backend 81/81, frontend 17/17, readiness 4/4, plus lint, typecheck, and build.
- PARTIAL: ordinary shift create/update does not yet validate and persist inside the shared employee lock protocol.
- Complete handoff: `docs/OPEN_ISSUES_HANDOFF.md`.

## Phase 7 — AMD Token Factory adapter (PR open; live inference blocked)

- Implemented: explicit AMD provider configuration, fixed official Token Factory base URL, strict response schema/model/grounding validation, safe provenance, visible source labels, deterministic fallback, and a synthetic live-evidence command.
- Verified: focused tests, full local non-database regression, lint, typecheck, build, and PR CI including PostgreSQL passed for commit `43e2359`.
- BLOCKED: no `AI_API_KEY`, exact Token Factory model ID, successful live request, or human-reviewed runtime evidence is available.
- Pull request: `https://github.com/123114-robot/shiftops-ai-act3/pull/7`; do not merge without review.

## Phase 8 — Scheduling-write serialization (implemented locally; database verification blocked)

- Implemented: ordinary shift create/update/reassignment/unassignment/cancel use transaction-scoped validation, deterministic employee lock ordering, Serializable retry, and stable concurrency errors.
- Verified locally: focused unit/route/transaction tests, full non-database regression, lint, typecheck, and production build.
- BLOCKED: the added ordinary-create-versus-proposal-apply PostgreSQL race test could not run because the Docker Desktop Linux engine was unavailable.
- Delivery state: local branch only; not pushed, merged, or deployed.

## Later work (not authorized)

- Execute and record a real AMD Token Factory inference run once credentials and an exact model ID are available.
- Select and implement the optional Evolus track only with an event workspace and explicit track decision.
- Deploy and submit only after the evidence gate is complete.
