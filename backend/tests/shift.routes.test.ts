import bcrypt from 'bcryptjs';
import express from 'express';
import request from 'supertest';
import { describe,expect,it } from 'vitest';
import { createShiftRouter } from '../src/routes/shifts.js';
import { AuthenticationService,type AuthUserRepository } from '../src/services/AuthenticationService.js';
import { ShiftService,type ShiftRepository } from '../src/services/ShiftService.js';
import { SchedulingError,type ShiftValidator } from '../src/services/SchedulingService.js';
const hash=await bcrypt.hash('ShiftFlow123!',4);const users=[{id:'m',email:'manager@test.local',passwordHash:hash,role:'MANAGER' as const,employeeId:null},{id:'u',email:'employee@test.local',passwordHash:hash,role:'EMPLOYEE' as const,employeeId:'e1'}];
const authRepo:AuthUserRepository={findByEmail:async email=>users.find(user=>user.email===email)??null,findById:async id=>users.find(user=>user.id===id)??null};
const shift={id:'s1',employeeId:null,date:new Date('2026-10-01T00:00:00.000Z'),startTime:'09:00',endTime:'17:00',role:'Chef',notes:null,status:'DRAFT' as const,createdById:'m',createdAt:new Date(),updatedAt:new Date()};
const repo:ShiftRepository={listByDateRange:async()=>[shift],findById:async id=>id==='s1'?shift:null,create:async input=>({...shift,...input}),update:async(_id,input)=>({...shift,...input}),cancel:async()=>({...shift,status:'CANCELLED'})};
const auth=new AuthenticationService(authRepo,'test-secret-at-least-32-characters');const validator:ShiftValidator={validate:async candidate=>{if(candidate.startTime==='16:00')throw new SchedulingError('SHIFT_OVERLAP','Employee already has an overlapping shift.');}};const app=express();app.use(express.json());app.use('/api/shifts',createShiftRouter(auth,new ShiftService(repo,validator)));async function token(email:string){return(await auth.login(email,'ShiftFlow123!')).token;}
describe('shift routes',()=>{
  it('lists by required date range and creates shifts for managers',async()=>{const bearer=await token(users[0]!.email);expect((await request(app).get('/api/shifts?startDate=2026-10-01&endDate=2026-10-07').set('Authorization',`Bearer ${bearer}`)).status).toBe(200);expect((await request(app).post('/api/shifts').set('Authorization',`Bearer ${bearer}`).send({date:'2026-10-01',startTime:'09:00',endTime:'17:00',role:'Chef'})).status).toBe(201);});
  it('edits and cancels shifts',async()=>{const bearer=await token(users[0]!.email);expect((await request(app).patch('/api/shifts/s1').set('Authorization',`Bearer ${bearer}`).send({role:'Head Chef'})).body.shift.role).toBe('Head Chef');expect((await request(app).delete('/api/shifts/s1').set('Authorization',`Bearer ${bearer}`)).body.shift.status).toBe('CANCELLED');});
  it('rejects invalid input',async()=>{const bearer=await token(users[0]!.email);const response=await request(app).post('/api/shifts').set('Authorization',`Bearer ${bearer}`).send({date:'bad',startTime:'9',endTime:'17:00',role:''});expect(response.status).toBe(400);expect(response.body.error.code).toBe('VALIDATION_ERROR');});
  it('returns stable scheduling conflict errors',async()=>{const bearer=await token(users[0]!.email);const response=await request(app).post('/api/shifts').set('Authorization',`Bearer ${bearer}`).send({employeeId:'e1',date:'2026-10-01',startTime:'16:00',endTime:'20:00',role:'Chef'});expect(response.status).toBe(409);expect(response.body.error.code).toBe('SHIFT_OVERLAP');});
  it('forbids employees',async()=>{const bearer=await token(users[1]!.email);expect((await request(app).get('/api/shifts?startDate=2026-10-01&endDate=2026-10-07').set('Authorization',`Bearer ${bearer}`)).status).toBe(403);});
});
