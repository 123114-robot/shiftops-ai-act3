# ShiftOps AI UI/UX Implementation Plan

Date: 2026-10-16 (Australia/Sydney)

Branch: `feature/shiftops-ui-ux-redesign`

Base: `5360ce5` (`origin/feature/phase-0-foundation`)

## Existing implementation

- React 19, React Router 7, TypeScript, Vite and project-owned CSS; no component library is required.
- Auth restoration and role-protected routes already separate Manager and Employee workspaces.
- Manager routes cover dashboard, employees, shifts, leave, roster and ShiftOps Copilot. Employee routes cover schedule, availability, leave and roster.
- Employee create/read/update/deactivate APIs already exist. The Manager-only employee PATCH contract already accepts `status`, so reactivation can reuse the existing record and endpoint.
- The roster API exposes seven-day manager and employee views. The Manager-only shifts API already accepts arbitrary validated date ranges and is the appropriate source for day, month and custom roster views.
- Phase 8 atomic scheduling remediation, Phase 9 demo readiness, Phase 10 browser evidence, repository cleanup and the AMD grounded-inference fix/evidence are included in the selected base.

## Missing functionality

- No shared application shell, sidebar, current-page hierarchy or persistent light/dark theme.
- Page-level CSS hardcodes dark colours and provides inconsistent button/form states.
- Employee list/detail presentation is cramped; deactivation lacks confirmation; inactive employees cannot be reactivated from the UI.
- Roster supports only a manually selected week and has no quick navigation, longer ranges, structured status/action columns or useful empty state.
- Shift create/edit modes are visually ambiguous and shift cancellation lacks confirmation.
- Dashboard and secondary pages lack consistent loading, error, empty and responsive presentation.

## Files to modify

- `frontend/src/App.tsx`, `frontend/src/main.tsx` and global/page CSS.
- New focused shared UI and theme modules under `frontend/src/components` and `frontend/src/features/theme`.
- Employee, roster, shift, dashboard, availability, leave and ShiftOps pages.
- `frontend/src/api/employees.ts` and `frontend/src/api/roster.ts` only where existing contracts need clearer client helpers.
- `frontend/tests/App.test.tsx` and focused UI tests.
- `docs/UI_UX_UAT_CHECKLIST.md` and `docs/STATUS.md`.

## Components to reuse

- Existing AuthProvider/useAuth, ProtectedRoute, AvailabilityWeek and page-specific API clients.
- Existing employee edit/profile components, extended rather than replaced.
- Existing status values and deterministic server-derived data.

## Necessary API changes

- No backend or database contract change is planned.
- Add a frontend `reactivateEmployee` helper that PATCHes `{ "status": "ACTIVE" }` through the existing Manager-only employee endpoint.
- Use the existing shift date-range client for Manager day/month/custom roster queries; retain `/roster/me` for the employee weekly schedule.

## Risks

- A shared layout refactor could accidentally expose Manager links to Employees; navigation tests will assert role-specific visibility.
- Local-date calculations can drift when implemented with UTC conversion; date helpers will operate on local calendar parts.
- Confirmation dialogs can confuse editing cancellation with persisted shift cancellation; labels and tests will distinguish them.
- Broad CSS changes can reduce contrast or break narrow layouts; semantic tokens and responsive checks will be used.
- The untracked root AMD evidence file predates this branch and will remain untouched and excluded from commits.

## Development sequence

1. Add theme state, semantic tokens and shared layout/components.
2. Move authenticated pages into the shared shell with role-aware navigation.
3. Improve employee list/detail and add confirmed deactivate/reactivate flows.
4. Add roster period modes, navigation, validation and structured results.
5. Clarify shift create/edit/cancel flows and confirmations.
6. Apply shared states and styling to dashboard and secondary pages.
7. Run focused tests, full validation and manual browser acceptance where available.
8. Update status/UAT documentation, review the diff and commit locally.

## Tests

- Theme system preference, manual toggle, persistence and reload restoration.
- Manager/Employee navigation visibility and protected-route regression.
- Employee list/detail rendering, deactivation confirmation and reactivation.
- Shift create/edit/cancel labels, confirmations and success/error feedback.
- Roster day/week/month/custom queries, quick navigation, invalid ranges and empty states.
- Existing availability, leave, dashboard and ShiftOps workflows.
- Milestone commands: `npm run db:generate`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:readiness`, `npm run build`, `git diff --check`, plus database tests when PostgreSQL is available.

## Expected results

- A readable, responsive workforce dashboard with consistent light and dark themes.
- Clear role-aware navigation and page hierarchy without new or dead routes.
- Safer and clearer employee and shift operations, including record-preserving reactivation.
- Useful roster history and period navigation backed only by existing database APIs.
- No change to authentication, eligibility, scheduling transactions, ShiftOps approval/audit or AMD provider behavior.
