import { describe, expect, it } from 'vitest';
import { ShiftError, ShiftService, type Shift, type ShiftRepository } from '../src/services/ShiftService.js';

const shift: Shift = { id:'s1',employeeId:null,date:new Date('2026-10-01T00:00:00.000Z'),startTime:'09:00',endTime:'17:00',role:'Chef',notes:null,status:'DRAFT',createdById:'m1',createdAt:new Date(),updatedAt:new Date() };
const repository = (): ShiftRepository => ({
  listByDateRange:async()=>[shift],findById:async id=>id==='s1'?shift:null,
  createValidated:async input=>({...shift,...input}),updateValidated:async(id,input)=>{if(id!=='s1')throw new ShiftError('NOT_FOUND','Shift not found.');return({...shift,...input});},cancelValidated:async()=>({...shift,status:'CANCELLED'}),
});
describe('ShiftService',()=>{
  it('lists shifts by inclusive date range',async()=>{await expect(new ShiftService(repository()).list('2026-10-01','2026-10-07')).resolves.toEqual([shift]);});
  it('delegates creates and edits to the repository atomic validation boundary',async()=>{const service=new ShiftService(repository());await expect(service.create('m1',{date:'2026-10-01',startTime:'09:00',endTime:'17:00',role:'Chef'})).resolves.toMatchObject({createdById:'m1',role:'Chef'});await expect(service.update('s1',{role:'Head Chef'})).resolves.toMatchObject({role:'Head Chef'});});
  it('soft cancels through the repository atomic boundary',async()=>{await expect(new ShiftService(repository()).cancel('s1')).resolves.toMatchObject({status:'CANCELLED'});});
  it('returns NOT_FOUND for unknown shifts',async()=>{await expect(new ShiftService(repository()).update('missing',{role:'Chef'})).rejects.toMatchObject({code:'NOT_FOUND'});});
});
