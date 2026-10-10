import { describe,expect,it } from 'vitest';
import { SchedulingService,type SchedulingRepository } from '../src/services/SchedulingService.js';

const candidate={employeeId:'e1',date:new Date('2026-09-28T00:00:00.000Z'),startTime:'09:00',endTime:'17:00'};
const repository=(overrides:Partial<SchedulingRepository>={}):SchedulingRepository=>({
  getEmployeeStatus:async()=> 'ACTIVE',
  getAvailability:async()=>({isAvailable:true,startTime:'09:00',endTime:'17:00'}),
  hasApprovedLeave:async()=>false,
  hasOverlap:async()=>false,
  ...overrides,
});
describe('SchedulingService',()=>{
  it('rejects equal or reversed times',async()=>{const service=new SchedulingService(repository());await expect(service.validate({...candidate,endTime:'09:00'})).rejects.toMatchObject({code:'INVALID_SHIFT_TIME'});await expect(service.validate({...candidate,startTime:'18:00'})).rejects.toMatchObject({code:'INVALID_SHIFT_TIME'});});
  it('rejects overlapping shifts',async()=>{const service=new SchedulingService(repository({hasOverlap:async()=>true}));await expect(service.validate(candidate)).rejects.toMatchObject({code:'SHIFT_OVERLAP'});});
  it('allows adjacent non-overlapping shifts',async()=>{const service=new SchedulingService(repository({getAvailability:async()=>({isAvailable:true,startTime:'09:00',endTime:'20:00'}),hasOverlap:async(_employeeId,_date,start)=>start!=='17:00'}));await expect(service.validate({...candidate,startTime:'17:00',endTime:'20:00'})).resolves.toBeUndefined();});
  it('rejects shifts outside declared availability',async()=>{const service=new SchedulingService(repository({getAvailability:async()=>({isAvailable:true,startTime:'09:00',endTime:'17:00'})}));await expect(service.validate({...candidate,startTime:'18:00',endTime:'20:00'})).rejects.toMatchObject({code:'AVAILABILITY_CONFLICT'});});
  it('rejects approved leave and inactive employees',async()=>{await expect(new SchedulingService(repository({hasApprovedLeave:async()=>true})).validate(candidate)).rejects.toMatchObject({code:'EMPLOYEE_ON_LEAVE'});await expect(new SchedulingService(repository({getEmployeeStatus:async()=> 'INACTIVE'})).validate(candidate)).rejects.toMatchObject({code:'EMPLOYEE_INACTIVE'});});
  it('allows an unassigned valid shift without employee checks',async()=>{await expect(new SchedulingService(repository()).validate({...candidate,employeeId:null})).resolves.toBeUndefined();});
});
