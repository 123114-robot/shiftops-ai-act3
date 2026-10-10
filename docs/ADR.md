# Architecture Decision Record

## ADR-001 — Isolated source snapshot

- Status: Accepted, 2026-10-10
- Decision: Create a new Git repository from the tracked ShiftFlow commit `6ea907b`, without copying its Git history or configuring a remote.
- Rationale: Protects the portfolio repository, preserves attribution/provenance, and keeps hackathon work independently reviewable.
- Consequence: Future upstream synchronization must be explicit and reviewed.

## ADR-002 — Preserve the modular monolith

- Status: Accepted
- Decision: Retain React + Express + Prisma/PostgreSQL and existing route/service/repository boundaries.
- Rationale: The current stack already supports authentication, RBAC, scheduling, tests, and CI. A new framework or database would add risk without Phase 0 value.

## ADR-003 — Database-independent health contract

- Status: Accepted
- Decision: Add only `GET /api/shiftops/health` in Phase 0.
- Rationale: It proves routing, compilation, and test harness readiness while making no claim that business or provider integrations exist.

## ADR-004 — Provider configuration without integration

- Status: Accepted
- Decision: Reserve server-side `AI_*` environment names with deterministic mode as the default; implement no provider client yet.
- Rationale: Prevents secret leakage and avoids pretending AMD or Evolus access is available.

## Open decisions

- Competition track selection and Evolus participation.
- Exact AMD Developer Cloud/vLLM model and evidence method.
- Minimal persistence additions for incident/proposal/audit, after Phase 1 design inspection.
