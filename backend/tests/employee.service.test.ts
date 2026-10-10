import { describe, expect, it } from 'vitest';
import { EmployeeService, type EmployeeRepository } from '../src/services/EmployeeService.js';

const employee = { id: 'employee-1', userId: null, firstName: 'Barry', lastName: 'Nguyen', email: 'barry@shiftflow.local', phone: null, jobTitle: 'Chef', status: 'ACTIVE' as const, createdAt: new Date(), updatedAt: new Date() };

const createRepository = (): EmployeeRepository => ({
  list: async () => [employee],
  findById: async (id) => id === employee.id ? employee : null,
  create: async (input) => ({ ...employee, ...input }),
  update: async (_id, input) => ({ ...employee, ...input }),
  deactivate: async () => ({ ...employee, status: 'INACTIVE' }),
});

describe('EmployeeService', () => {
  it('lists and retrieves employees', async () => {
    const service = new EmployeeService(createRepository());
    await expect(service.list()).resolves.toHaveLength(1);
    await expect(service.get(employee.id)).resolves.toMatchObject({ email: employee.email });
  });

  it('creates and updates an employee with validated fields', async () => {
    const service = new EmployeeService(createRepository());
    await expect(service.create({ firstName: 'Alice', lastName: 'Morgan', email: 'ALICE@shiftflow.local', jobTitle: 'Supervisor' })).resolves.toMatchObject({ email: 'alice@shiftflow.local' });
    await expect(service.update(employee.id, { jobTitle: 'Head Chef' })).resolves.toMatchObject({ jobTitle: 'Head Chef' });
  });

  it('soft deactivates instead of deleting', async () => {
    const service = new EmployeeService(createRepository());
    await expect(service.deactivate(employee.id)).resolves.toMatchObject({ id: employee.id, status: 'INACTIVE' });
  });

  it('returns NOT_FOUND for an unknown employee', async () => {
    const service = new EmployeeService(createRepository());
    await expect(service.get('missing')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
