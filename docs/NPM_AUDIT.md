# npm Audit Evidence

Measured: 2026-11-18 on `feature/shiftops-ui-ux-redesign`. Audit results are time-sensitive.

- Node: `v24.20.0`
- npm: `11.19.0`
- Compatible updates: Express `5.2.1 -> 5.3.0`, Vite `7.3.6 -> 7.3.8`, Zod `4.6.5 -> 4.6.7`, typescript-eslint `8.70.1 -> 8.73.0`, `body-parser` `2.3.0 -> 2.4.0`, and `qs` `6.16.0 -> 6.17.1`.
- Vitest was compatibility-tested and upgraded from `3.2.7` to `5.1.0`; Prisma remains at `6.19.3`.
- No `--force` update and no Prisma major upgrade was performed.

## Current measurement

- Full tree: 14 findings — 14 high, 0 critical.
- `--omit=dev`: 7 findings — 7 high, 0 critical.
- The former Vitest/tinypool critical chain and Express `body-parser`/`qs` chains are resolved.
- The remaining findings are two build/tooling families: Prisma CLI/config (`prisma`, `@prisma/config`, `deepmerge-ts`) and the newly published `picomatch` advisory propagated through Vite/tinyglobby/fdir and related development tools.
- Counts represent npm's affected dependency nodes, not 14 independent advisories. `--omit=dev` still includes build-time tooling reachable through workspace dependency classification; it is not evidence that every listed package ships in the static runtime bundle.

## Remediation performed

Compatible resolutions removed the previous Zod, `body-parser`, `qs`, and earlier typescript-eslint advisory chains. Vitest 5 removed the two critical Vitest/tinypool findings. Clean `npm ci`, lint, typecheck, tests, Prisma generation/validation, migration deployment, and production builds passed with the updated dependency graph.

## Deferred compatibility work

- Prisma remediation requires a separately tested major upgrade and migration from `package.json#prisma` configuration.
- At measurement time, the latest published `picomatch` was `4.0.7`, still within the advisory range. npm proposed downgrading Vite to `6.2.7`; that framework downgrade was not treated as a safe automatic fix.

These findings remain release risks and must not be described as resolved. Re-run the audit immediately before any future production release.
