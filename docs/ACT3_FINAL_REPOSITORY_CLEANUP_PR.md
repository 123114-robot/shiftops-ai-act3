# PR: Align repository documentation for ACT III evaluation

## Summary

This documentation-focused cleanup aligns the public repository with the verified Phase 10 integration state. It does not change product behavior, add live AMD evidence, deploy the application, rename the default branch, or submit the project.

## Repository status

- Base: current default branch `feature/phase-0-foundation` at verified integration commit `e6bae759476ce9340f27957c20eff1f4937befab`.
- Included before this cleanup: merged Phase 8 scheduling serialization and leave-review atomicity remediation, Phase 9 reproducible PostgreSQL demo evidence, and Phase 10 local browser evidence.
- Latest pre-cleanup integration CI: GitHub Actions run `38827402353`, successful with PostgreSQL.
- Cleanup branch: `docs/act3-final-repository-cleanup` (local only until publication is explicitly authorized).

## README changes

- Adds the product problem, users, core features, architecture, and technology stack.
- Documents setup, validation commands, CI evidence, and the Manager demo workflow.
- States that the AMD Token Factory adapter is implemented while live execution remains `UNVERIFIED`.
- Separates implemented local behavior from deployment and submission evidence.
- Records ShiftFlow source provenance and the unresolved licensing boundary.

## Documentation corrections

- Replaces Phase 7-as-latest and PR #7-open wording with the merged Phase 10 integration state.
- Records merged Phase 8–10 progress and integration commit `e6bae759`.
- Records the deadline as 18 October 2026 at 9:00 PM AEDT, sourced from the user's authenticated lablab.ai event page screenshot; Codex did not independently inspect the screenshot.
- Preserves historical audit evidence while updating current status and handoff summaries.

## CI and validation

- Adds `docs/**` to CI push triggers so this required branch name receives the same verification workflow after authorized publication.
- Pre-cleanup remote evidence: run `38827402353` passed.
- Cleanup validation results:
  - `npm run test:readiness`: PASS, 5/5.
  - `npm run submission:check` with public-repository evidence: correctly reports local `READY`, repository `VERIFIED`, AMD `BLOCKED`, Evolus `NOT_SELECTED`, and assets `MISSING`.
  - `npm run lint`: PASS.
  - `npm run typecheck`: PASS.
  - `npm test` with PostgreSQL explicitly enabled: PASS, backend 95/95 and frontend 17/17 with zero skips.
  - `npm run build`: PASS.
  - `git diff --check`: PASS.

The first database-enabled test attempt used an incorrect local PostgreSQL password and failed authentication before database assertions. After using the repository's documented Docker development connection and confirming schema sync, the full suite passed. This was an environment configuration error, not a product-code change.

## Default branch recommendation

`feature/phase-0-foundation` is misleading because it now contains Phases 0–10. Rename it to `main` only after this cleanup is reviewed and merged.

Verified constraints:

- `main` does not currently exist.
- The current default branch is not protected.
- The CI workflow already handles pushes and pull requests targeting `main`.
- No history rewrite or force-push is required.

Owner procedure after merge:

1. In GitHub repository settings, rename `feature/phase-0-foundation` to `main` using the branch rename control.
2. Confirm GitHub reports `main` as the default branch and preserves PR/commit history.
3. Add branch protection or a ruleset requiring the `Verify` CI check and preventing force pushes.
4. Keep the Phase-specific development branches as historical evidence.
5. Update local clones with `git fetch origin --prune`, switch tracking to `origin/main`, and verify `origin/HEAD` points to `origin/main`.

Do not create a separate unrelated `main` branch or force-push; GitHub's rename operation is the safer history-preserving path.

## License and attribution findings

- ShiftOps AI derives from `123114-robot/ShiftFlow` commit `6ea907b742c547bd8e8941e64afddf089daf733f`.
- Both repositories are public under the same GitHub account, but neither has a detected license.
- Shared account ownership and file provenance do not prove copyright ownership or relicensing authority.
- No MIT `LICENSE` file is added by this cleanup.

Owner confirmation required:

> Do you own or have written permission for all imported ShiftFlow source and assets, and do you have authority to license the ShiftOps AI derivative under MIT while supplying any required third-party attribution?

Until the answer is documented, MIT compatibility remains `BLOCKED`.

## Remaining ACT III deliverables

- Authenticated enrollment, team, AMD Developer Program approval, and selected challenge evidence.
- Successful real AMD Token Factory inference with an exact model ID and sanitized runtime evidence.
- Public deployment and working application URL.
- Demo video, pitch deck PDF, and cover image.
- Licensing and attribution resolution.
- Final authenticated portal review and user-approved submission.

The optional Evolus partner track remains not selected.
