export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';
export type Employee = { id: string; userId: string | null; firstName: string; lastName: string; email: string; phone: string | null; jobTitle: string; status: EmployeeStatus; createdAt: Date; updatedAt: Date };
export type CreateEmployee = Pick<Employee, 'firstName' | 'lastName' | 'email' | 'jobTitle'> & { phone?: string | null };
export type UpdateEmployee = Partial<Pick<Employee, 'firstName' | 'lastName' | 'email' | 'phone' | 'jobTitle' | 'status'>>;

export interface EmployeeRepository {
  list(): Promise<Employee[]>;
  findById(id: string): Promise<Employee | null>;
  create(input: CreateEmployee): Promise<Employee>;
  update(id: string, input: UpdateEmployee): Promise<Employee>;
  deactivate(id: string): Promise<Employee>;
}

export class EmployeeError extends Error {
  constructor(public readonly code: 'NOT_FOUND', message: string) { super(message); }
}

export class EmployeeService {
  constructor(private readonly employees: EmployeeRepository) {}
  list() { return this.employees.list(); }
  async get(id: string) {
    const employee = await this.employees.findById(id);
    if (!employee) throw new EmployeeError('NOT_FOUND', 'Employee not found.');
    return employee;
  }
  create(input: CreateEmployee) { return this.employees.create({ ...input, email: input.email.toLowerCase() }); }
  async update(id: string, input: UpdateEmployee) {
    await this.get(id);
    return this.employees.update(id, { ...input, ...(input.email ? { email: input.email.toLowerCase() } : {}) });
  }
  async deactivate(id: string) {
    await this.get(id);
    return this.employees.deactivate(id);
  }
}
