# npm Audit Evidence

Measured: 2026-11-18 on `feature/shiftops-ui-ux-redesign`. Audit results are time-sensitive.

- Node: `v24.20.0`
- npm: `11.19.0`
- Lockfile-only compatible updates: Express `5.2.1 -> 5.3.0`, Vite `7.3.6 -> 7.3.8`, Zod `4.6.5 -> 4.6.7`, and typescript-eslint `8.70.1 -> 8.73.0`
- No `--force` update and no Prisma or Vitest major upgrade was performed.

## Current measurement

- Full tree: 8 findings — 2 moderate, 4 high, 2 critical.
- `--omit=dev`: 5 findings — 1 moderate, 4 high, 0 critical.
- The critical findings are confined to the Vitest/tinypool development and test chain.
- The remaining production-tree report contains the Prisma CLI/config development chain plus Express transitive `body-parser` and `qs` advisories. npm includes the Prisma CLI chain in `--omit=dev` because the build installs development tooling for Prisma generation and migration commands.

## Remediation performed

Compatible patch/minor resolutions removed the previous Vite, Zod, and typescript-eslint advisory chains. Clean `npm ci`, lint, typecheck, tests, Prisma generation/validation, and production builds passed with the updated lockfile.

## Deferred compatibility work

- Vitest remediation requires the separately tested major upgrade to Vitest 5.
- Prisma remediation requires a separately tested major upgrade and migration from `package.json#prisma` configuration.
- At the measurement time, Express `5.3.0` still resolves `body-parser@2.3.0` and `qs@6.16.0`, both within the advisory ranges; no safe published resolution was available through the current Express dependency range.

These findings remain release risks and must not be described as resolved. Re-run the audit immediately before any future production release.
