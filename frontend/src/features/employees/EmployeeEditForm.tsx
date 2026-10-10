import type { FormEvent } from 'react';
import type { Employee } from '../../api/employees';

type EditableEmployee = Pick<Employee, 'firstName' | 'lastName' | 'email' | 'phone' | 'jobTitle'>;

export function EmployeeEditForm({ employee, onSave }: {
  employee: Employee;
  onSave: (input: EditableEmployee) => Promise<void>;
}) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await onSave({
      firstName: String(data.get('firstName')),
      lastName: String(data.get('lastName')),
      email: String(data.get('email')),
      phone: String(data.get('phone')) || null,
      jobTitle: String(data.get('jobTitle')),
    });
  }

  return (
    <form className="employee-form" onSubmit={(event) => void submit(event)}>
      {(['firstName', 'lastName', 'email', 'phone', 'jobTitle'] as const).map((field) => (
        <label key={field}>
          {field.replace(/([A-Z])/g, ' $1')}
          <input
            name={field}
            type={field === 'email' ? 'email' : 'text'}
            defaultValue={employee[field] ?? ''}
            required={field !== 'phone'}
          />
        </label>
      ))}
      <button type="submit">Save changes</button>
    </form>
  );
}
