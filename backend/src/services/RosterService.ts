import type{Shift}from'./ShiftService.js';
export interface RosterRepository{list(start:Date,end:Date,employeeId?:string):Promise<Shift[]>}
export class RosterService{constructor(private readonly roster:RosterRepository){}weekly(weekStart:string,employeeId?:string){const start=new Date(`${weekStart}T00:00:00.000Z`);const end=new Date(start);end.setUTCDate(end.getUTCDate()+6);return this.roster.list(start,end,employeeId);}}
