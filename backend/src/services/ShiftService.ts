export type ShiftStatus = 'DRAFT' | 'SCHEDULED' | 'CANCELLED';
export type Shift = { id:string;employeeId:string|null;date:Date;startTime:string;endTime:string;role:string;notes:string|null;status:ShiftStatus;createdById:string;createdAt:Date;updatedAt:Date };
export type CreateShiftInput = { employeeId?:string|null;date:string;startTime:string;endTime:string;role:string;notes?:string|null;status?:Exclude<ShiftStatus,'CANCELLED'> };
export type UpdateShiftInput = Partial<Omit<CreateShiftInput,'status'>> & { status?:Exclude<ShiftStatus,'CANCELLED'> };
type PersistedCreate = Omit<CreateShiftInput,'date'> & { date:Date;createdById:string };
type PersistedUpdate = Omit<UpdateShiftInput,'date'> & { date?:Date };
export interface ShiftRepository {listByDateRange(start:Date,end:Date):Promise<Shift[]>;findById(id:string):Promise<Shift|null>;createValidated(input:PersistedCreate):Promise<Shift>;updateValidated(id:string,input:PersistedUpdate):Promise<Shift>;cancelValidated(id:string):Promise<Shift>}
export class ShiftError extends Error {constructor(public readonly code:'NOT_FOUND',message:string){super(message)}}
const toDate=(value:string)=>new Date(`${value}T00:00:00.000Z`);
export class ShiftService {
  constructor(private readonly shifts:ShiftRepository){}
  list(startDate:string,endDate:string){return this.shifts.listByDateRange(toDate(startDate),toDate(endDate));}
  create(createdById:string,input:CreateShiftInput){const date=toDate(input.date);return this.shifts.createValidated({...input,date,createdById});}
  update(id:string,input:UpdateShiftInput){const{date:dateInput,...changes}=input;return this.shifts.updateValidated(id,{...changes,...(dateInput?{date:toDate(dateInput)}:{})});}
  cancel(id:string){return this.shifts.cancelValidated(id);}
}
