import type { CreateEmployee, EmployeeRepository, UpdateEmployee } from '../services/EmployeeService.js';
import { prisma } from './prisma.js';

export class PrismaEmployeeRepository implements EmployeeRepository {
  list() { return prisma.employee.findMany({ orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }] }); }
  findById(id: string) { return prisma.employee.findUnique({ where: { id } }); }
  create(input: CreateEmployee) { return prisma.employee.create({ data: input }); }
  update(id: string, input: UpdateEmployee) { return prisma.employee.update({ where: { id }, data: input }); }
  deactivate(id: string) { return prisma.employee.update({ where: { id }, data: { status: 'INACTIVE' } }); }
}
