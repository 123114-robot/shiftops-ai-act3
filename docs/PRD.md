# Product Requirements — Phase 0 Baseline

## Product

ShiftOps AI assists a manager in resolving an uncovered shift through deterministic candidate evaluation, an explainable proposal, explicit manager approval, an authorized schedule update, and an audit trail.

## Users and problem

The primary user is a store manager or workforce supervisor who currently checks availability, overlaps, leave, qualifications, and hours manually. The product must reduce review effort without making autonomous employment decisions.

## Phase 0 acceptance criteria

1. Preserve a verified ShiftFlow source snapshot in an isolated repository.
2. Document product scope, architecture, decisions, roadmap, competition evidence, and current status.
3. Provide reproducible dependency and environment setup without secrets.
4. Expose a database-independent `GET /api/shiftops/health` endpoint.
5. Include a clearly synthetic future-workflow fixture and smoke test.
6. Retain or minimally adapt CI and record actual local checks.

## Explicitly out of scope

Eligibility, ranking, incidents, proposals, approvals, schedule mutations, audit persistence, UI extensions, AI/AMD inference, Evolus, deployment, billing, and production claims.

## Safety constraints

Existing RBAC remains authoritative. Future AI output cannot change eligibility or mutate schedules. No real PII, secrets, automatic approval, or hard-coded legal claims.
