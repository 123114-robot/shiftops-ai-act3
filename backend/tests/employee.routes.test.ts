import bcrypt from 'bcryptjs';
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createEmployeeRouter } from '../src/routes/employees.js';
import { AuthenticationService, type AuthUserRepository } from '../src/services/AuthenticationService.js';
import { EmployeeService, type EmployeeRepository } from '../src/services/EmployeeService.js';

const hash = await bcrypt.hash('ShiftFlow123!', 4);
const users = [{ id:'m',email:'manager@test.local',passwordHash:hash,role:'MANAGER' as const,employeeId:null },{ id:'u',email:'employee@test.local',passwordHash:hash,role:'EMPLOYEE' as const,employeeId:'e1' }];
const authRepo: AuthUserRepository = { findByEmail: async email => users.find(u=>u.email===email)??null, findById: async id=>users.find(u=>u.id===id)??null };
const employee = { id:'e1',userId:'u',firstName:'Barry',lastName:'Nguyen',email:'employee@test.local',phone:null,jobTitle:'Chef',status:'ACTIVE' as const,createdAt:new Date(),updatedAt:new Date() };
const status: 'ACTIVE'|'INACTIVE' = 'ACTIVE';
const repo: EmployeeRepository = { list:async()=>[{...employee,status}],findById:async id=>id==='e1'?{...employee,status}:null,create:async input=>({...employee,...input}),update:async(_id,input)=>({...employee,...input,status:input.status??status}),deactivate:async()=>({...employee,status:'INACTIVE'}) };
const auth = new AuthenticationService(authRepo,'test-secret-at-least-32-characters');
const app=express(); app.use(express.json()); app.use('/api/employees',createEmployeeRouter(auth,new EmployeeService(repo)));
async function token(email:string){return (await auth.login(email,'ShiftFlow123!')).token;}

describe('employee routes',()=>{
  it('allows managers to list and create employees',async()=>{const bearer=await token(users[0].email); expect((await request(app).get('/api/employees').set('Authorization',`Bearer ${bearer}`)).status).toBe(200); expect((await request(app).post('/api/employees').set('Authorization',`Bearer ${bearer}`).send({firstName:'Alice',lastName:'Morgan',email:'alice@test.local',jobTitle:'Supervisor'})).status).toBe(201);});
  it('forbids employees from the directory',async()=>{const bearer=await token(users[1].email); const response=await request(app).get('/api/employees').set('Authorization',`Bearer ${bearer}`); expect(response.status).toBe(403); expect(response.body.error.code).toBe('FORBIDDEN');});
  it('soft deactivates employees',async()=>{const bearer=await token(users[0].email); const response=await request(app).delete('/api/employees/e1').set('Authorization',`Bearer ${bearer}`); expect(response.status).toBe(200); expect(response.body.employee.status).toBe('INACTIVE');});
});
