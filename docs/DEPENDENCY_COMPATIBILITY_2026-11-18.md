# Dependency Compatibility Gate — 2026-11-18

Branch: `feature/shiftops-ui-ux-redesign`

Scope: local dependency hardening only. No push, merge, deployment, provider request, or competition submission was performed.

## Implemented

- Refreshed Express-compatible transitive packages to `body-parser@2.4.0` and `qs@6.17.1` without overrides or framework replacement.
- Upgraded Vitest in both workspaces from 3.2.7 to 5.1.0 as the only major-version candidate in this phase.
- Kept Prisma and `@prisma/client` at 6.19.3; no Prisma major migration was attempted.

## Compatibility evidence

- Clean dependency installation: PASS.
- Prisma Client generation and schema validation: PASS.
- Empty disposable PostgreSQL migration deploy: PASS.
- Second migration deploy: PASS, no pending migrations.
- PostgreSQL-enabled backend: 95/95 PASS, zero skips.
- Frontend: 23/23 PASS.
- Submission readiness: 5/5 PASS.
- Render deployment contract: 3/3 PASS.
- Lint, typecheck, and production build: PASS.
- Disposable database removed and local PostgreSQL/Docker stopped after verification.

## Audit outcome

- Before this phase: 8 findings (including 2 critical) in the full tree; 5 findings in the production-oriented audit.
- After safe transitive fixes and Vitest 5: 14 high findings and 0 critical in the full tree.
- After reclassifying Tailwind/Vite build tools as development dependencies: 3 high findings and 0 critical in the production-oriented audit. Those three nodes are the Prisma CLI/config chain; no reported advisory remains in the Express/React application runtime paths.
- The higher node count is caused by npm expanding a newly published `picomatch` advisory through Vite, tinyglobby, fdir, Vitest, and typescript-eslint. It does not reverse the removal of the two critical Vitest/tinypool findings.
- The latest published `picomatch@4.0.7` was still affected. npm suggested a Vite 6 downgrade, so no speculative downgrade or override was made.

## Deferred

- Prisma 7.10.1 was evaluated in an isolated disposable worktree. `prisma generate` failed because Prisma 7 no longer accepts `datasource.url` in `schema.prisma` and requires `prisma.config.ts` plus a driver adapter or Accelerate URL. This is an architectural database-connection migration, so the worktree was removed and the current branch remains on Prisma 6.19.3.
- Reassess the Vite/picomatch chain when a patched compatible release is published.
- AMD authorization, licensing, production deployment changes, public UAT, and competition submission remain external or owner-controlled gates.

## Conclusion

Vitest 5 compatibility and production/tooling dependency classification: **VERIFIED locally**. Prisma 7 compatibility: **BLOCKED by required architecture migration**. Overall dependency security: **PARTIAL** because high-severity build/tooling advisories remain without a safe compatible patch.
