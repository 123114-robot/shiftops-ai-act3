import type { SchedulingRepository } from '../services/SchedulingService.js';
import { prisma } from './prisma.js';
import type { TransactionClient } from '../shiftops/SchedulingTransaction.js';
const days=['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'] as const;
export class PrismaSchedulingRepository implements SchedulingRepository {
  constructor(private readonly client:TransactionClient|typeof prisma=prisma){}
  async getEmployeeStatus(employeeId:string){return(await this.client.employee.findUnique({where:{id:employeeId},select:{status:true}}))?.status??null;}
  getAvailability(employeeId:string,dayOfWeek:number){return this.client.availability.findUnique({where:{employeeId_dayOfWeek:{employeeId,dayOfWeek:days[dayOfWeek]!}},select:{isAvailable:true,startTime:true,endTime:true}});}
  async hasApprovedLeave(employeeId:string,date:Date){return(await this.client.leaveRequest.count({where:{employeeId,status:'APPROVED',startDate:{lte:date},endDate:{gte:date}}}))>0;}
  async hasOverlap(employeeId:string,date:Date,startTime:string,endTime:string,excludeShiftId?:string){return(await this.client.shift.count({where:{employeeId,date,status:{not:'CANCELLED'},startTime:{lt:endTime},endTime:{gt:startTime},...(excludeShiftId?{id:{not:excludeShiftId}}:{})}}))>0;}
}
