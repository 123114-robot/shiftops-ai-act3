# Static Site Build Hardening — 2026-11-18

## Problem

The frontend correctly classifies Vite, TypeScript, Tailwind, and the Tailwind Vite plugin as development dependencies. The Render Static Site blueprint still used plain `npm ci`, which can omit those packages when the build environment sets `NODE_ENV=production`.

## Change

- Static Site Build Command: `npm ci --include=dev && npm run build -w frontend`
- The deployment contract now requires that exact command.
- `docs/RENDER_DEPLOYMENT.md` explains why build dependencies must be installed while only `frontend/dist` is published.

No runtime dependency, route, business rule, database schema, or deployed service was changed.

## TDD evidence

1. Added the Static Site Build Command assertion to `scripts/render-deployment.test.mjs`.
2. Confirmed RED against the previous `npm ci` command.
3. Updated `render.yaml` and deployment documentation.
4. Confirmed deployment tests 3/3 GREEN.

## Validation

- `NODE_ENV=production` plus `npm ci --include=dev`: PASS.
- Frontend production build: PASS, 73 modules transformed.
- Backend non-database tests: 84 passed, 11 database-gated skips.
- Frontend tests: 23/23 PASS.
- PostgreSQL-enabled backend: 95/95 PASS, zero skips.
- Empty disposable migration deploy and second idempotent deploy: PASS.
- Readiness: 5/5 PASS.
- Deployment contract: 3/3 PASS.
- Prisma generation/schema validation, lint, typecheck, full production build, and diff check: PASS.
- Disposable database removed and local PostgreSQL/Docker stopped after verification.

## Evidence boundary

This proves the repository build contract locally. Render was not operated and the public deployment was not changed. The owner must update or redeploy the Static Site from an authorized commit before claiming this command is active in production.
