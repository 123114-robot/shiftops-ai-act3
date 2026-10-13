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

## Phase 5 — Submission readiness and evidence gate (current)

- Completed: refreshed public-requirement audit, public-repository verification, submission draft, checklist, five-minute demo script, runtime evidence template, and secret-safe readiness checker.
- BLOCKED: authenticated enrollment/deadline confirmation, license compatibility, deployed application, video, deck, real AMD inference evidence, and any optional Evolus eligibility.
- No real AMD/Evolus API call was made and no compliance claim is implied.

## Later work (not authorized)

- Execute and record a real AMD-hosted inference run once approved infrastructure and credentials are available.
- Select and implement the optional Evolus track only with an event workspace and explicit track decision.
- Deploy and submit only after the evidence gate is complete.
