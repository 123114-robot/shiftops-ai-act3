# Pull Request Draft: ShiftOps AI UI/UX Redesign and UAT Remediation

## 1. Summary

Introduces a semantic light/dark design system, role-aware application shell and focused usability improvements across workforce management without replacing the stack or changing scheduling rules.

## 2. Motivation

The existing functional UI was visually cramped, used inconsistent page-level styling and made create/edit/cancel operations difficult to distinguish. This change makes the existing workflow easier to read and safer to operate before AMD ACT III submission.

## 3. Changes by page

- Dashboard: responsive KPI cards, truthful zero-state and quick navigation.
- Employees: desktop table, mobile cards, explicit actions, confirmation before deactivation and record-preserving reactivation.
- Employee detail: structured profile rows, edit/save/cancel clarity and status actions.
- Weekly roster: Day/Week/Month/Custom modes, presets, period navigation, range validation, structured results and empty state.
- Shifts: clear creation/editing modes, explicit feedback and confirmation before persisted cancellation.
- Availability, leave and ShiftOps Copilot: shared layout, readable cards and consistent status/error states.

## 4. Shared design system

Adds semantic CSS tokens, light/dark themes, persistent theme selection, system preference default, shared AppLayout, ThemeToggle, StatusBadge, EmptyState and ConfirmationDialog components.

## 5. Employee reactivation implementation

The UI calls the existing Manager-only employee PATCH endpoint with `status: ACTIVE`. It restores the existing record rather than creating a duplicate; no backend or database contract was added.

## 6. Weekly Roster improvements

Manager range modes reuse the existing shift date-range endpoint. Employee weekly schedule continues to use the existing employee roster endpoint. No saved rosters or generated data were introduced.

## 7. Files modified

See the branch diff and `docs/UI_UX_IMPLEMENTATION_PLAN.md` for the scoped frontend, test and documentation files.

## 8. Tests performed

Final command results are recorded in `docs/STATUS.md`. Manual and owner checks remain separately tracked in `docs/UI_UX_UAT_CHECKLIST.md`.

## 9. Before/after evidence

Add browser screenshots after local authenticated UAT. Automated component evidence is provided by the frontend test suite and production build.

## 10. Known limitations

- No P2 calendar visualisation, drag-and-drop or advanced analytics.
- Manual responsive and authenticated browser UAT must be completed against a running local database.
- This change does not provide or alter live AMD inference evidence.

## 11. Hackathon impact

Improves readability and operator confidence while preserving deterministic eligibility, explicit approval, transactional schedule mutation, audit history and AMD provenance boundaries.

## 12. Rollback instructions

Revert the UI/UX commit on this feature branch. No schema migration, data conversion or backend API rollback is required.

Status: draft only. Do not create, push or merge this PR without owner approval.
