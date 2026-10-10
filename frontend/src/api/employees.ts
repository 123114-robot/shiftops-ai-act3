export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
};

type EmployeeInput = Pick<Employee, 'firstName' | 'lastName' | 'email' | 'phone' | 'jobTitle'>;
const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function employeeRequest<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? 'Employee request failed.');
  }
  return response.json() as Promise<T>;
}

export async function listEmployees(token: string) {
  return (await employeeRequest<{ employees: Employee[] }>('/employees', token)).employees;
}

export async function getEmployee(token: string, id: string) {
  return (await employeeRequest<{ employee: Employee }>(`/employees/${id}`, token)).employee;
}

export async function createEmployee(token: string, input: Omit<EmployeeInput, 'phone'>) {
  return (await employeeRequest<{ employee: Employee }>('/employees', token, {
    method: 'POST',
    body: JSON.stringify(input),
  })).employee;
}

export async function updateEmployee(token: string, id: string, input: EmployeeInput) {
  return (await employeeRequest<{ employee: Employee }>(`/employees/${id}`, token, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })).employee;
}

export async function deactivateEmployee(token: string, id: string) {
  return (await employeeRequest<{ employee: Employee }>(`/employees/${id}`, token, {
    method: 'DELETE',
  })).employee;
}
