import { describe, expect, it } from 'vitest';
import { ShiftService, type Shift, type ShiftRepository } from '../src/services/ShiftService.js';

const shift: Shift = { id:'s1',employeeId:null,date:new Date('2026-10-01T00:00:00.000Z'),startTime:'09:00',endTime:'17:00',role:'Chef',notes:null,status:'DRAFT',createdById:'m1',createdAt:new Date(),updatedAt:new Date() };
const repository = (): ShiftRepository => ({
  listByDateRange:async()=>[shift],findById:async id=>id==='s1'?shift:null,
  create:async input=>({...shift,...input}),update:async(_id,input)=>({...shift,...input}),cancel:async()=>({...shift,status:'CANCELLED'}),
});
const validator={validate:async()=>{}};
describe('ShiftService',()=>{
  it('lists shifts by inclusive date range',async()=>{await expect(new ShiftService(repository(),validator).list('2026-10-01','2026-10-07')).resolves.toEqual([shift]);});
  it('creates and edits shifts',async()=>{const service=new ShiftService(repository(),validator);await expect(service.create('m1',{date:'2026-10-01',startTime:'09:00',endTime:'17:00',role:'Chef'})).resolves.toMatchObject({createdById:'m1',role:'Chef'});await expect(service.update('s1',{role:'Head Chef'})).resolves.toMatchObject({role:'Head Chef'});});
  it('soft cancels instead of deleting',async()=>{await expect(new ShiftService(repository(),validator).cancel('s1')).resolves.toMatchObject({status:'CANCELLED'});});
  it('returns NOT_FOUND for unknown shifts',async()=>{await expect(new ShiftService(repository(),validator).update('missing',{role:'Chef'})).rejects.toMatchObject({code:'NOT_FOUND'});});
});
