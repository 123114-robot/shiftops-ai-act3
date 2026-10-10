# Testing Strategy

Use RED → GREEN → REFACTOR for observable behaviour. Prioritise service tests for time, overlap, adjacency, availability, leave, inactive employees, and ownership. Add Supertest tests for status codes, errors, and RBAC. UI tests cover critical workflows, not internals.

Phase 1 has a health test, mocked frontend connection test, Prisma validation, and opt-in PostgreSQL SELECT 1 test. Each phase runs targeted tests, then lint, builds, and regression.
