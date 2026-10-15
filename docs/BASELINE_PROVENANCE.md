# Baseline Provenance

Verified: 2026-10-13.

- Source repository: `https://github.com/123114-robot/ShiftFlow`
- Source branch recorded at snapshot: `codex/phase-9-basic-dashboard`
- Source commit: `6ea907b742c547bd8e8941e64afddf089daf733f`
- New repository: `https://github.com/123114-robot/shiftops-ai-act3`
- Initial combined Phase 0 commit: `5d56248117aa6b83d1e55cb5a656a0e16f5396a3`
- Phase 0 normalization commit: `66800d41cf2e0f85a012f2d612ea55913397eaeb`

## Verification method

The exact source commit was fetched directly from the source GitHub repository. Git tree comparison between source `6ea907b` and initial project commit `5d56248` produced the following Phase 0 file-level delta:

- Modified: `.env.example`, `README.md`, `backend/.env.example`, `backend/src/app.ts`, `backend/tests/health.test.ts`
- Added: `AGENTS.md`, `backend/src/routes/shiftops-health.ts`, `backend/tests/fixtures/shiftops-scenario.json`
- Added documentation: `docs/ADR.md`, `docs/ARCHITECTURE.md`, `docs/COMPETITION_REQUIREMENTS.md`, `docs/PRD.md`, `docs/ROADMAP.md`, `docs/STATUS.md`

The original ShiftFlow checkout was not modified by this project. The new repository intentionally started with a new Git history, so the initial commit combines the imported source tree and Phase 0 additions; this document supplies the missing comparison trace without rewriting history.

## Limitations and licensing

- The tree comparison verifies file content, commits and repository origins; it does not prove authorship or legal ownership.
- GitHub reports no detected license for either repository. MIT compatibility remains BLOCKED until the owner confirms licensing and attribution.
- No fake baseline commit, synthetic bundle or reconstructed history was created.
