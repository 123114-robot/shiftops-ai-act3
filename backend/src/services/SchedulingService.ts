export type EmployeeStatus='ACTIVE'|'INACTIVE';
export type SchedulingCandidate={employeeId:string|null;date:Date;startTime:string;endTime:string};
export type AvailabilityWindow={isAvailable:boolean;startTime:string|null;endTime:string|null};
export interface SchedulingRepository {
  getEmployeeStatus(employeeId:string):Promise<EmployeeStatus|null>;
  getAvailability(employeeId:string,dayOfWeek:number):Promise<AvailabilityWindow|null>;
  hasApprovedLeave(employeeId:string,date:Date):Promise<boolean>;
  hasOverlap(employeeId:string,date:Date,startTime:string,endTime:string,excludeShiftId?:string):Promise<boolean>;
}
export type SchedulingErrorCode='INVALID_SHIFT_TIME'|'SHIFT_OVERLAP'|'AVAILABILITY_CONFLICT'|'EMPLOYEE_ON_LEAVE'|'EMPLOYEE_INACTIVE'|'EMPLOYEE_NOT_FOUND';
export class SchedulingError extends Error {constructor(public readonly code:SchedulingErrorCode,message:string){super(message)}}
export interface ShiftValidator {validate(candidate:SchedulingCandidate,excludeShiftId?:string):Promise<void>}
export class SchedulingService implements ShiftValidator {
  constructor(private readonly scheduling:SchedulingRepository){}
  async validate(candidate:SchedulingCandidate,excludeShiftId?:string){
    if(candidate.startTime>=candidate.endTime)throw new SchedulingError('INVALID_SHIFT_TIME','Shift end time must be later than start time.');
    if(!candidate.employeeId)return;
    const status=await this.scheduling.getEmployeeStatus(candidate.employeeId);
    if(!status)throw new SchedulingError('EMPLOYEE_NOT_FOUND','Employee not found.');
    if(status==='INACTIVE')throw new SchedulingError('EMPLOYEE_INACTIVE','Inactive employees cannot be assigned to shifts.');
    const availability=await this.scheduling.getAvailability(candidate.employeeId,candidate.date.getUTCDay());
    if(!availability?.isAvailable||!availability.startTime||!availability.endTime||candidate.startTime<availability.startTime||candidate.endTime>availability.endTime)throw new SchedulingError('AVAILABILITY_CONFLICT','Shift falls outside the employee availability.');
    if(await this.scheduling.hasApprovedLeave(candidate.employeeId,candidate.date))throw new SchedulingError('EMPLOYEE_ON_LEAVE','Employee is on approved leave for this date.');
    if(await this.scheduling.hasOverlap(candidate.employeeId,candidate.date,candidate.startTime,candidate.endTime,excludeShiftId))throw new SchedulingError('SHIFT_OVERLAP','Employee already has an overlapping shift.');
  }
}
