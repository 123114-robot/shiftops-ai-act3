import type{RosterRepository}from'../services/RosterService.js';import{prisma}from'./prisma.js';
export class PrismaRosterRepository implements RosterRepository{list(start:Date,end:Date,employeeId?:string){return prisma.shift.findMany({where:{date:{gte:start,lte:end},status:{not:'CANCELLED'},...(employeeId?{employeeId}:{})},orderBy:[{date:'asc'},{startTime:'asc'}]});}}
