# ShiftOps AI UI/UX UAT Checklist

Date: 2026-10-16 (Australia/Sydney)

Branch: `feature/shiftops-ui-ux-redesign`

This checklist separates automated coverage from browser verification and owner acceptance. An unchecked manual item is not a failure and must not be reported as passed.

| Area | Automated coverage | Browser check | Owner UAT |
| --- | --- | --- | --- |
| 1. Manager login | Existing auth route regression | [x] Local synthetic Manager reached dashboard | [ ] |
| 2. Dashboard | KPI and navigation rendering | [x] Real zero values, empty state and quick actions observed | [ ] |
| 3. Employee management | List, status and Manager navigation tests | [~] Narrow-screen cards observed; desktop visual check pending | [ ] |
| 4. Employee detail | Profile and edit regression | [ ] Verify labels, dividers, edit/save/cancel feedback | [ ] |
| 5. Employee reactivation | PATCH status action test | [ ] Deactivate, confirm, then reactivate the same record | [ ] |
| 6. Availability | Existing save/load regression | [ ] Update a day and confirm success/error state | [ ] |
| 7. Shift management | Create/edit/cancel state and confirmation tests | [ ] Create, edit, cancel editing, then confirm saved-shift cancellation | [ ] |
| 8. Weekly roster | Manager/employee, custom range and invalid range tests | [~] Week controls and empty state observed; other modes covered automatically | [ ] |
| 9. Light mode | Theme toggle and persistence test | [x] Light palette and navigation persistence observed | [ ] |
| 10. Dark mode | Theme toggle and persistence test | [x] Dark palette observed | [ ] |
| 11. Responsive layout | CSS breakpoint implementation | [~] Approximately 350 px layout observed; wide-screen browser check pending | [ ] |
| 12. ShiftOps Copilot regression | Evaluate/propose/approve/reject/apply tests | [ ] Confirm deterministic/provider label and audit history remain truthful | [ ] |
| 13. Employee RBAC | Role-aware navigation test and protected routes | [ ] Confirm Manager-only links/actions are absent for Employee | [ ] |
| 14. Error/loading states | Focused rendering tests | [ ] Exercise failed API and slow-loading states | [ ] |

## Evidence rules

- Automated results belong in `docs/STATUS.md` only after the commands finish.
- Browser checks require a running local API, PostgreSQL and authenticated synthetic account.
- Owner UAT remains pending until the owner performs or explicitly accepts each item.
- Mocked UI tests and deterministic fallback must never be described as live AMD inference.
