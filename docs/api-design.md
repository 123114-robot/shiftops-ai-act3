# API Design

- Auth: POST /api/auth/login; GET /api/auth/me
- Employees: GET/POST /api/employees; GET/PATCH/DELETE /api/employees/:id
- Availability: GET/PUT /api/availability/me; GET /api/employees/:id/availability
- Shifts: GET/POST /api/shifts; GET/PATCH/DELETE /api/shifts/:id; POST /api/shifts/:id/assign
- Leave: POST /api/leave-requests; GET /api/leave-requests/me; GET /api/leave-requests; PATCH /api/leave-requests/:id/status
- Operations: GET /api/health

Shift lists accept startDate and endDate. Errors use an error object with stable code and readable message.
