# npm Audit Evidence

Measured: 2026-10-13 on Phase 6. Audit results are time-sensitive.

- Node: `v24.20.0`
- npm: `11.19.0`
- Source commit before dependency fix: `c74087f`
- Initial lockfile SHA-256: `1C22D280F58B92D397AAAE4BBDF1E31BB00689FADFDEDC054819FBFCB3CC1673`
- Updated lockfile SHA-256: `47A4EF00AB1A0CC246D4B7234570A8A2D4C61CA4E5C441419A7AEF78E1E641D8`

## Initial measurement

- Full tree: 9 findings — 1 moderate, 4 high, 4 critical.
- `--omit=dev`: 4 high findings.
- Direct affected packages: `concurrently` (critical chain), `prisma` (high chain), `vitest` (critical/moderate chains).
- Transitive affected packages included `shell-quote`, `source-map-js`, `deepmerge-ts`, `@prisma/config`, `tinypool`, and `@vitest/mocker`.

## Safe scoped remediation

`npm audit fix` without `--force` changed only lockfile resolutions:

- `concurrently` 9.2.4 → 9.2.5
- `shell-quote` 1.9.0 → 1.12.0
- `source-map-js` 1.2.1 → 1.2.2

No framework major version was changed.

## Remaining measurement

- Full tree: 6 findings — 1 moderate, 3 high, 2 critical.
- `--omit=dev`: 3 high findings.
- Remaining dev/test chain: Vitest requires a major upgrade to 5.0.4 according to npm audit.
- Remaining Prisma CLI/config chain: npm proposes a version change it labels breaking; no forced downgrade/upgrade was applied.

The unresolved findings require a separate compatibility-tested dependency phase. `npm audit fix --force` was not run.
