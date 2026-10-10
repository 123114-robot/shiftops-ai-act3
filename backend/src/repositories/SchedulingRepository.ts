import type { SchedulingRepository } from '../services/SchedulingService.js';
import { prisma } from './prisma.js';
const days=['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'] as const;
export class PrismaSchedulingRepository implements SchedulingRepository {
  async getEmployeeStatus(employeeId:string){return(await prisma.employee.findUnique({where:{id:employeeId},select:{status:true}}))?.status??null;}
  getAvailability(employeeId:string,dayOfWeek:number){return prisma.availability.findUnique({where:{employeeId_dayOfWeek:{employeeId,dayOfWeek:days[dayOfWeek]!}},select:{isAvailable:true,startTime:true,endTime:true}});}
  async hasApprovedLeave(employeeId:string,date:Date){return(await prisma.leaveRequest.count({where:{employeeId,status:'APPROVED',startDate:{lte:date},endDate:{gte:date}}}))>0;}
  async hasOverlap(employeeId:string,date:Date,startTime:string,endTime:string,excludeShiftId?:string){return(await prisma.shift.count({where:{employeeId,date,status:{not:'CANCELLED'},startTime:{lt:endTime},endTime:{gt:startTime},...(excludeShiftId?{id:{not:excludeShiftId}}:{})}}))>0;}
}
