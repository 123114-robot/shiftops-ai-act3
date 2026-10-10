import type { ShiftValidator } from './SchedulingService.js';

export type ShiftStatus = 'DRAFT' | 'SCHEDULED' | 'CANCELLED';
export type Shift = { id:string;employeeId:string|null;date:Date;startTime:string;endTime:string;role:string;notes:string|null;status:ShiftStatus;createdById:string;createdAt:Date;updatedAt:Date };
export type CreateShiftInput = { employeeId?:string|null;date:string;startTime:string;endTime:string;role:string;notes?:string|null;status?:Exclude<ShiftStatus,'CANCELLED'> };
export type UpdateShiftInput = Partial<Omit<CreateShiftInput,'status'>> & { status?:Exclude<ShiftStatus,'CANCELLED'> };
type PersistedCreate = Omit<CreateShiftInput,'date'> & { date:Date;createdById:string };
type PersistedUpdate = Omit<UpdateShiftInput,'date'> & { date?:Date };
export interface ShiftRepository {listByDateRange(start:Date,end:Date):Promise<Shift[]>;findById(id:string):Promise<Shift|null>;create(input:PersistedCreate):Promise<Shift>;update(id:string,input:PersistedUpdate):Promise<Shift>;cancel(id:string):Promise<Shift>}
export class ShiftError extends Error {constructor(public readonly code:'NOT_FOUND',message:string){super(message)}}
const toDate=(value:string)=>new Date(`${value}T00:00:00.000Z`);
export class ShiftService {
  constructor(private readonly shifts:ShiftRepository,private readonly validator:ShiftValidator){}
  list(startDate:string,endDate:string){return this.shifts.listByDateRange(toDate(startDate),toDate(endDate));}
  async create(createdById:string,input:CreateShiftInput){const date=toDate(input.date);await this.validator.validate({employeeId:input.employeeId??null,date,startTime:input.startTime,endTime:input.endTime});return this.shifts.create({...input,date,createdById});}
  async update(id:string,input:UpdateShiftInput){const existing=await this.require(id);const date=input.date?toDate(input.date):existing.date;await this.validator.validate({employeeId:input.employeeId===undefined?existing.employeeId:input.employeeId,date,startTime:input.startTime??existing.startTime,endTime:input.endTime??existing.endTime},id);const{date:dateInput,...changes}=input;return this.shifts.update(id,{...changes,...(dateInput?{date}:{})});}
  async cancel(id:string){await this.require(id);return this.shifts.cancel(id);}
  private async require(id:string){const shift=await this.shifts.findById(id);if(!shift)throw new ShiftError('NOT_FOUND','Shift not found.');return shift;}
}
