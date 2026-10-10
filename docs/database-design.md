# Database Design

- User: unique email, password hash, role, optional employee link.
- Employee: contact/job data and active status; owns availability, leave, and shifts.
- Availability: one recurring row per employee/day with optional times.
- Shift: date, HH:mm boundaries, role, notes, status, optional employee, creator.
- LeaveRequest: inclusive range, reason, status, optional reviewer/time.

Restrictive employee foreign keys protect history. Date and employee indexes support roster queries. Services validate cross-record rules.
