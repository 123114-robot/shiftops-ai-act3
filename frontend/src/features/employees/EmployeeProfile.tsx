import type { Employee } from '../../api/employees';

export function EmployeeProfile({ employee }: { employee: Employee }) {
  return (
    <dl className="profile-list">
      <div className="profile-row"><dt>Email</dt><dd>{employee.email}</dd></div>
      <div className="profile-row"><dt>Phone</dt><dd>{employee.phone || 'Not provided'}</dd></div>
      <div className="profile-row"><dt>Job title</dt><dd>{employee.jobTitle}</dd></div>
      <div className="profile-row"><dt>Status</dt><dd>{employee.status}</dd></div>
      <div className="profile-row"><dt>Created date</dt><dd>{new Date(employee.createdAt).toLocaleDateString()}</dd></div>
    </dl>
  );
}
