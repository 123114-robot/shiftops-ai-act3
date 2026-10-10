import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { deactivateEmployee, getEmployee, updateEmployee, type Employee } from '../api/employees';
import { useAuth } from '../features/auth/auth-context';
import { EmployeeEditForm } from '../features/employees/EmployeeEditForm';
import { EmployeeProfile } from '../features/employees/EmployeeProfile';

type EditableEmployee = Pick<Employee, 'firstName' | 'lastName' | 'email' | 'phone' | 'jobTitle'>;

export function EmployeeDetailPage() {
  const { id = '' } = useParams();
  const { token } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) void getEmployee(token, id).then(setEmployee).catch((caught: Error) => setError(caught.message));
  }, [id, token]);

  async function save(input: EditableEmployee) {
    if (!token) return;
    try {
      setError('');
      setEmployee(await updateEmployee(token, id, input));
      setEditing(false);
      setMessage('Employee updated successfully.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to update employee.');
    }
  }

  async function deactivate() {
    if (!token) return;
    try {
      setError('');
      setEmployee(await deactivateEmployee(token, id));
      setMessage('Employee deactivated successfully.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to deactivate employee.');
    }
  }

  if (error && !employee) return <main className="dashboard-shell"><section className="dashboard-card"><p role="alert">{error}</p><Link to="/employees">Back to employees</Link></section></main>;
  if (!employee) return <main className="loading-screen">Loading employee…</main>;

  return (
    <main className="dashboard-shell">
      <nav><strong>ShiftFlow</strong><Link to="/employees">Back to employees</Link></nav>
      <section className="dashboard-card employee-detail">
        <header><p className="eyebrow">Employee profile</p><h1>{employee.firstName} {employee.lastName}</h1><span className={`badge badge--${employee.status.toLowerCase()}`}>{employee.status}</span></header>
        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}
        {editing ? <EmployeeEditForm employee={employee} onSave={save} /> : <EmployeeProfile employee={employee} />}
        <div className="detail-actions">
          <Link className="secondary button-link" to={`/employees/${id}/availability`}>View availability</Link>
          <button className="secondary" onClick={() => { setEditing((value) => !value); setMessage(''); }}>{editing ? 'Cancel' : 'Edit employee'}</button>
          {employee.status === 'ACTIVE' && !editing && <button className="secondary danger" onClick={() => void deactivate()}>Deactivate employee</button>}
        </div>
      </section>
    </main>
  );
}
