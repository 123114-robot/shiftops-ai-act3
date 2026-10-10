import type { ShiftRepository } from '../services/ShiftService.js';
import { prisma } from './prisma.js';
export class PrismaShiftRepository implements ShiftRepository {
  listByDateRange(start:Date,end:Date){return prisma.shift.findMany({where:{date:{gte:start,lte:end}},orderBy:[{date:'asc'},{startTime:'asc'}]});}
  findById(id:string){return prisma.shift.findUnique({where:{id}});}
  create(input:Parameters<ShiftRepository['create']>[0]){return prisma.shift.create({data:input});}
  update(id:string,input:Parameters<ShiftRepository['update']>[1]){return prisma.shift.update({where:{id},data:input});}
  cancel(id:string){return prisma.shift.update({where:{id},data:{status:'CANCELLED'}});}
}
