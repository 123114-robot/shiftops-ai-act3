import type { Employee } from '../../api/employees';

export function EmployeeProfile({ employee }: { employee: Employee }) {
  return (
    <dl>
      <dt>Email</dt><dd>{employee.email}</dd>
      <dt>Phone</dt><dd>{employee.phone || 'Not provided'}</dd>
      <dt>Job title</dt><dd>{employee.jobTitle}</dd>
      <dt>Status</dt><dd>{employee.status}</dd>
      <dt>Created</dt><dd>{new Date(employee.createdAt).toLocaleDateString()}</dd>
    </dl>
  );
}
