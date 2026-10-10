# Roadmap

Each phase requires user verification and explicit approval before the next begins.

## Phase 0 — Foundation (current)

Protected source snapshot, evidence-bounded requirements, architecture/docs, environment contract, health endpoint, synthetic fixture, smoke tests, and CI baseline.

## Proposed Phase 1 — Data and eligibility contract

- Inspect current Prisma models and scheduling service call sites in detail.
- Define read-only ShiftOps data adapter interfaces over existing employee, availability, leave, and shift data.
- Write tests for the synthetic Liam/Noah/Olivia scenario.
- Implement deterministic eligibility only: active status, full availability, overlap, approved leave, existing role constraints, and configurable hours.
- Return reasons/blockers with stable tie-breaking; no persistence mutation, AI explanation, proposal workflow, or UI.

## Later phases (not authorized)

2. Proposal state machine, manager authorization, idempotent application, and audit transaction.
3. Grounded explanation provider with deterministic fallback and real AMD path.
4. Minimal manager UI and end-to-end demo.
5. Verified partner/competition integration and submission packaging.
