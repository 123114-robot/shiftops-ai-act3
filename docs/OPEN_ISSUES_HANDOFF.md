# Open Issues and External-Model Handoff

Last reviewed: 2026-10-14 (Australia/Sydney)
Repository: `https://github.com/123114-robot/shiftops-ai-act3`
Latest implementation branch: `feature/phase-7-amd-token-factory`
Latest implementation commit: `43e235900fd42b641f50790c9fc5d30bb9cc8a5c`
Open pull request: `https://github.com/123114-robot/shiftops-ai-act3/pull/7`

This document is a handoff for GPT, Kimi, or a human reviewer. It records work that remains unfinished after the Phase 7 adapter implementation. It is not authorization to implement, deploy, submit, merge, purchase services, or expose credentials. Proposed solutions must preserve backend authority, Manager approval, RBAC, auditability, and deterministic fallback behavior.

## Evidence labels

- **VERIFIED**: supported by repository, CI, or primary-source evidence.
- **PARTIAL**: implemented only for the stated paths; a known gap remains.
- **BLOCKED**: requires credentials, ownership confirmation, an external account, or a user decision.
- **UNVERIFIED**: plausible or documented publicly, but not proven for this project/account.
- **NOT SELECTED**: optional work that must not start until the user chooses it.

## Executive summary

The application skeleton and Phases 0–7 are substantially implemented and tested within their stated boundaries. Phase 7 adds a grounded AMD Token Factory adapter and evidence command; PR #7 CI passed, including PostgreSQL-backed tests. No real Token Factory request has succeeded because credentials and an exact model ID were unavailable. The project is not submission-ready or production-ready because the issues below remain.

| ID | Unfinished item | Status | Primary dependency | Recommended owner |
| --- | --- | --- | --- | --- |
| U-01 | Confirm enrollment, approval, challenge, and deadline | BLOCKED / UNVERIFIED | Authenticated event portal or organizers | User / event admin |
| U-02 | Resolve source ownership and licensing | BLOCKED | Repository owner/legal decision | User / owner |
| U-03 | Prove real AMD-hosted inference | BLOCKED | AMD access, endpoint, model, credentials | Infrastructure engineer |
| U-04 | Decide whether to enter the Evolus partner track | NOT SELECTED | Product decision and event workspace | User / architect |
| U-05 | Verify ordinary shift-write concurrency hardening | IMPLEMENTED / UNVERIFIED | PostgreSQL integration run | Backend engineer |
| U-06 | Remediate remaining dependency advisories | PARTIAL | Compatibility-tested upgrades | Maintainer |
| U-07 | Create a production database migration baseline | UNVERIFIED / REQUIRED FOR RELEASE | Deployment database strategy | Backend/DevOps engineer |
| U-08 | Deploy a publicly reachable prototype | BLOCKED | Platform, secrets, database, budget decision | DevOps engineer |
| U-09 | Produce and verify submission assets | BLOCKED | U-01, U-02, U-03, U-08 | Product/presentation owner |
| U-10 | Perform final authenticated submission | BLOCKED | All mandatory evidence and user approval | User |

## U-01 — Competition account, track, and deadline confirmation

**Current status:** BLOCKED / UNVERIFIED.

### What is known

- Public event material requires lablab enrollment and AMD AI Developer Program participation/approval.
- Public pages disagree: the overview describes an online build ending 18 October 2026, while the live page describes 17 October 2026.
- The public material identifies four main challenge areas, but this project has not recorded a final challenge selection.

### Why it is unfinished

Account-specific enrollment, team membership, AMD approval, exact submission cutoff, and portal access cannot be proven from repository files or public pages.

### Required investigation

1. Open the authenticated event portal and capture enrollment/team state.
2. Confirm AMD AI Developer Program approval and any cloud allocation.
3. Obtain the exact submission date, time, and timezone from the portal or organizer/Discord announcement.
4. Select and record the main challenge category.
5. Record evidence without storing session cookies, tokens, or private account details in Git.

### Acceptance evidence

- A dated, sanitized note naming the confirmed challenge and exact cutoff with timezone.
- A private screenshot or organizer message proving enrollment/team/approval.
- Public documentation updated only with non-sensitive facts.

## U-02 — Source ownership, reuse permission, and license

**Current status:** BLOCKED.

### What is known

- ShiftOps AI was created from ShiftFlow commit `6ea907b742c547bd8e8941e64afddf089daf733f`.
- `docs/BASELINE_PROVENANCE.md` records the exact file-level Phase 0 delta.
- GitHub reports no detected license for either repository.
- Event material describes an originality/MIT-compatibility requirement.

### Why it is unfinished

Code provenance does not prove authorship, ownership, permission to relicense, or compliance with the event's pre-existing-code rules. Adding an MIT file without authority could be legally incorrect.

### Required design/legal questions

1. Who owns the ShiftFlow code and all imported assets?
2. Does the user have authority to license the derivative repository under MIT?
3. Does the event allow this pre-existing baseline, and what attribution/disclosure is required?
4. Are any third-party assets, fonts, datasets, or copied snippets governed by separate terms?

### Acceptance evidence

- Written owner confirmation or an existing valid source license.
- A reviewed dependency/asset attribution list.
- A license and NOTICE/provenance treatment approved by the owner.
- Confirmation of reuse eligibility from official rules or organizers if the rules remain ambiguous.

## U-03 — Real AMD infrastructure and inference evidence

**Current status:** BLOCKED.

### What is already implemented

- An explicit server-side `amd-token-factory` provider using the fixed documented Token Factory base URL.
- Strict response schema, employee ID, exact reason-code set, duplicate, known-label, and response-model validation.
- Locally rendered trusted explanations with distinct AMD, deterministic fallback, deterministic, and mocked-test labels.
- Sanitized provider/model/request-ID/latency provenance without keys, raw prompts, or employee PII.
- A synthetic `npm run amd:verify -w backend` evidence command that refuses to overwrite an existing evidence file.
- Mocked tests and passing PR CI proving adapter and failure behavior, not live AMD execution.

### Why it is unfinished

The shared Token Factory endpoint contract is implemented, but no account access, exact model ID, credentials, quota, hardware identity, or successful real request has been provided. Configuration variables, mocked tests, and green CI are not runtime AMD evidence.

### Required design work

1. Confirm Token Factory account access, available model IDs, quota, and whether the selected model/runtime satisfies the event's AMD requirement.
2. Supply the key and exact model ID through environment variables only; never place them in Git, documentation, evidence, or chat.
3. Run `npm run amd:verify -w backend` against the fixed endpoint using the synthetic fixture.
4. Human-review the generated evidence and supporting Token Factory platform evidence before marking runtime VERIFIED.
5. Confirm the demo visibly exercises the same AMD path and that deterministic scheduling remains authoritative.

### Acceptance evidence

- A successful real request tied to a Git commit.
- Timestamp, endpoint host only, model ID, serving software/version, AMD environment/hardware, latency, request ID when safe, validation result, and fallback status.
- Sanitized screenshot/log evidence.
- A failure-path test showing that loss or corruption of the remote response cannot bypass deterministic rules or Manager approval.

## U-04 — Optional Evolus partner-track decision

**Current status:** NOT SELECTED / BLOCKED.

### Why it is unfinished

The main hackathon does not require Evolus. Entering its partner prize would add architecture, workspace, telemetry, API, and containerization obligations. There is no event code, workspace, API key, connected AMD vLLM endpoint, or user decision.

### Decision questions

1. Is the additional partner prize worth the implementation and evidence risk before the deadline?
2. Which two named Evolus building blocks provide real product value rather than superficial compliance?
3. Can Evolus remain advisory without weakening backend authority or human approval?
4. Can the team demonstrate containerization, workspace configuration, app-driven API calls, and telemetry?

### Acceptance evidence if selected

- Explicit user approval and architecture review.
- Event workspace and team endpoint connected.
- At least two named building blocks used in a meaningful flow.
- API-call, container, configuration, and telemetry evidence.

If not selected, record `Evolus: not used` truthfully and do not add placeholder integration.

## U-05 — Ordinary shift create/update concurrency gap

**Current status:** IMPLEMENTED locally; PostgreSQL cross-route verification remains BLOCKED.

### What is already protected

- Proposal apply uses an employee-scoped PostgreSQL advisory lock.
- It revalidates eligibility inside a Serializable transaction.
- Shift assignment, proposal status, incident status, and audit write are atomic.
- Availability replacement and approved-leave mutation use the same employee lock.
- PostgreSQL CI includes a concurrency test where two overlapping proposal applies race and only one commits.
- Ordinary shift create/update/reassignment/unassignment/cancel now validate and persist inside the shared Serializable transaction boundary.
- Reassignments acquire unique old/new employee locks in deterministic lexical order.
- Exhausted Prisma serialization retries map to `CONCURRENT_SCHEDULE_UPDATE`.

### Exact remaining gap

The implementation and non-database regressions pass, and an ordinary-create-versus-proposal-apply race test is present. The local Docker Desktop Linux engine is unavailable, so that test has not executed against PostgreSQL. Update/reassignment versus proposal apply and availability/leave cross-route races also remain without direct PostgreSQL evidence.

### Remaining verification questions

1. Does the new cross-route race pass repeatedly against the CI PostgreSQL service?
2. Do update/reassignment, availability, and approved-leave races exhibit the same one-writer outcome?
3. Does retry exhaustion leave shifts, proposals, incidents, and audit records unchanged?
4. Are advisory-lock wait time and retry telemetry sufficient for deployment diagnostics?

### Required tests

- Ordinary create racing proposal apply for the same employee/time.
- Ordinary update/reassignment racing proposal apply.
- Shift delete or unassign racing apply, if supported.
- Two-employee reassignment with deterministic lock ordering.
- Availability/leave mutation racing ordinary shift mutation.
- Retry exhaustion with no partial schedule, incident, proposal, or audit changes.
- Real PostgreSQL integration tests; in-memory mocks are insufficient for the concurrency claim.

### Acceptance criteria

- Code review confirms every current authoritative scheduling write uses the documented shared lock/transaction protocol.
- Eligibility is validated through the transaction client immediately before persistence.
- Conflicting concurrent operations cannot both commit in repeatable PostgreSQL tests.
- Non-conflicting operations retain acceptable behavior and performance.
- ADR and architecture documentation describe the invariant and residual limitations.

## U-06 — Remaining npm security advisories

**Current status:** PARTIAL; time-sensitive.

### What is known

- A safe non-forced `npm audit fix` removed three findings.
- The last measured full tree had 6 findings: 1 moderate, 3 high, 2 critical.
- The last measured production-only tree had 3 high findings.
- Remaining chains involve Vitest and Prisma/config dependencies.
- npm suggested changes with breaking-version implications; `npm audit fix --force` was deliberately not used.

### Why it is unfinished

Blind forced changes could downgrade or major-upgrade tooling, break Prisma generation/runtime compatibility, or invalidate tests. Audit results also change over time and must be remeasured.

### Required work

1. Re-run `npm audit` and `npm audit --omit=dev`; save machine-readable results for comparison.
2. Map each advisory to runtime reachability and dev-only exposure.
3. Check official Prisma and Vitest migration guidance for compatible target versions.
4. Upgrade one dependency family at a time on a separate branch.
5. Run database generation/validation, all tests including real PostgreSQL, lint, typecheck, and production build.
6. Document accepted residual risk if a compatible fix is unavailable.

### Acceptance criteria

- No unsupported claim of “secure” based only on a zero exit code.
- No `--force` change without reviewing the exact version/diff.
- Updated lockfile is reproducible with `npm ci`.
- All validation passes and remaining advisories have explicit disposition.

## U-07 — Production database migration baseline

**Current status:** UNVERIFIED / required before production release.

### Exact gap

The repository uses the established `prisma db push` development/CI strategy and has no reviewed historical Prisma migration baseline. This is adequate for the current prototype tests but not a safe production deployment/rollback story.

### Required design questions

1. Is the target deployment a fresh database only, or must it preserve existing ShiftFlow data?
2. What schema is currently deployed, if any?
3. How will a baseline migration be generated and reconciled without destructive drift?
4. What are backup, restore, rollback, and migration-lock procedures?
5. Which seed data is synthetic-only and must never run in production?

### Acceptance criteria

- A reviewed migration baseline and deployment procedure.
- Drift check against the intended target database.
- Backup/restore and rollback plan tested in a disposable environment.
- No production use of development seeds or `prisma db push` as an undocumented substitute for migrations.

## U-08 — Public deployment

**Current status:** BLOCKED.

### Why it is unfinished

No hosting platform, database provider, region, budget, domain, secrets policy, observability plan, or deployment approval has been selected. Earlier scope explicitly prohibited deployment.

### Required decisions

1. Choose a platform that can host the React frontend, Node backend, and PostgreSQL within event constraints.
2. Decide whether a free tier is reliable enough for judging and whether cold starts are acceptable.
3. Define environment variables, secret rotation, CORS/origin policy, HTTPS, database network access, and health checks.
4. Decide data-retention and demo-account strategy using synthetic data only.
5. Add minimal logs/monitoring without leaking tokens or PII.
6. Define a rollback target by immutable commit/image.

### Acceptance criteria

- Public HTTPS application URL and working Manager demo account or documented demo flow.
- Health check and core workflow verified from outside the developer machine.
- PostgreSQL-backed behavior verified in the deployed environment.
- Secrets absent from source, build artifacts, client bundle, and logs.
- Rollback procedure tested or rehearsed.

## U-09 — Video, deck, cover image, and final claims

**Current status:** BLOCKED.

### Missing artifacts

- Public working application URL.
- Demo video within the final verified event limit.
- Pitch deck PDF.
- Cover image.
- Final selected challenge.
- Verified AMD description and evidence.
- Final licensing/provenance statement.

### Required content rules

- Demonstrate the real product path; label any deterministic fallback.
- Do not call mocked tests, configuration values, or screenshots proof of AMD runtime.
- Do not claim production usage, time savings, legal compliance, or model accuracy without evidence.
- Show human approval, deterministic eligibility, transaction/audit behavior, and failure safety.
- Reconfirm event-specific upload size, format, duration, and required fields in the authenticated portal.

### Acceptance criteria

- Every submission claim maps to a repository commit, live run, primary rule, or clearly labelled future plan.
- Video, deck, cover, URLs, and repository are accessible in a clean/incognito session.
- No secrets, real employee PII, private endpoint paths, or account identifiers appear.
- A second person performs a claim/evidence review before submission.

## U-10 — Final authenticated submission

**Current status:** BLOCKED and user-controlled.

Final submission is an external, potentially irreversible action. It must not be performed by an assistant without explicit user approval immediately before submission.

### Final gate

- U-01, U-02, U-03, U-08, and U-09 resolved.
- U-04 explicitly selected and completed, or explicitly declined.
- U-05, U-06, and U-07 either resolved or transparently disclosed with a documented risk decision appropriate for a prototype.
- `npm run submission:check` reviewed by a human; file existence and URL shape are not evidence quality.
- Latest commit, branch, CI run, public visibility, deployed URL, video, and deck reverified.
- User gives explicit approval to submit.

## Recommended order

1. Resolve U-01 immediately because deadline and account access can invalidate all later work.
2. Resolve U-02 before making originality or MIT-compliance claims.
3. Decide U-04 so optional architecture work does not consume time accidentally.
4. Obtain AMD access and complete U-03.
5. Design and test U-05 as a dedicated backend phase.
6. Handle U-06 on an isolated dependency-upgrade branch.
7. Design U-07, then deploy via U-08.
8. Produce U-09 only after the runtime and deployment facts are stable.
9. Perform U-10 only after a final evidence review and explicit user approval.

## Copy/paste prompt for GPT or Kimi

```text
You are reviewing the unfinished work for ShiftOps AI.

Read docs/OPEN_ISSUES_HANDOFF.md first, then inspect only the repository files needed for the issue you are assigned. Treat VERIFIED, PARTIAL, BLOCKED, UNVERIFIED, and NOT SELECTED as strict evidence labels.

Your task is to propose a solution, not to claim implementation. For the selected issue:
1. Restate the exact problem and evidence boundary.
2. List assumptions and identify which require user, organizer, owner, or credential-holder input.
3. Offer 2–3 viable approaches with security, schedule, cost, rollback, and hackathon-evidence trade-offs.
4. Recommend one approach and explain why.
5. Define affected files/modules and any schema/API/transaction changes.
6. Define tests, failure cases, observability, and acceptance evidence.
7. Identify actions that require explicit human approval, credentials, payment, deployment, merge, visibility change, or submission.
8. Do not weaken authentication, MANAGER RBAC, deterministic eligibility, human approval, transaction/audit guarantees, or deterministic AI fallback.
9. Do not invent AMD, Evolus, licensing, enrollment, deployment, or submission evidence.
10. Stop after the design and implementation plan unless the user separately authorizes execution.

Assigned issue ID: [replace with U-01 to U-10]
```

## Source documents to inspect

- `docs/STATUS.md`
- `docs/ADR.md`
- `docs/ARCHITECTURE.md`
- `docs/COMPETITION_REQUIREMENTS.md`
- `docs/BASELINE_PROVENANCE.md`
- `docs/NPM_AUDIT.md`
- `docs/SUBMISSION_CHECKLIST.md`
- `docs/SUBMISSION_DRAFT.md`
- `docs/RUNTIME_EVIDENCE_TEMPLATE.md`

## Scope boundary

This handoff records gaps only. It does not authorize merging PR #7, deployment, purchase, partner-track enrollment, license changes, credential use, or final submission.
