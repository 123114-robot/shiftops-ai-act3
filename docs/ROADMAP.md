# Roadmap

Each phase requires user verification and explicit approval before the next begins.

## Phase 0 — Foundation (complete)

Protected source snapshot, evidence-bounded requirements, architecture/docs, environment contract, health endpoint, synthetic fixture, smoke tests, and CI baseline.

## Phase 1 — Data and eligibility contract (complete)

- Completed: read-only adapter contract and Prisma implementation over existing employee, availability, leave, and shift data.
- Completed: synthetic Liam/Noah/Olivia tests plus inactive, unavailable, role, hours, zero-candidate, invalid-shift, and tie-breaking coverage.
- Completed: deterministic blockers, reasons, configurable role/weekly-minute policy, and stable ranking.
- Excluded: persistence mutation, AI explanation, proposal workflow, API, and UI.

## Phase 2 — Proposal workflow (current)

- Completed: incident and proposal persistence, stable state transitions, Manager-only API, approval/rejection, apply-time eligibility revalidation, optimistic concurrency, stale detection, atomic schedule mutation, and audit records.
- Completed: service/route tests and an opt-in PostgreSQL transaction integration test.
- Excluded: AI explanation provider, UI, notifications, deployment, and partner integrations.

## Later phases (not authorized)

3. Grounded explanation provider with deterministic fallback and real AMD path.
4. Minimal manager UI and end-to-end demo.
5. Verified partner/competition integration and submission packaging.
