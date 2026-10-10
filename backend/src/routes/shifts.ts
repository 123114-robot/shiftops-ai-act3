import { Router,type Response } from 'express';
import { z } from 'zod';
import { authenticate,requireRole,type AuthenticatedRequest } from '../middleware/auth.js';
import type { AuthenticationService } from '../services/AuthenticationService.js';
import { ShiftError,type ShiftService } from '../services/ShiftService.js';
import { SchedulingError } from '../services/SchedulingService.js';
const date=/^\d{4}-\d{2}-\d{2}$/;const time=/^([01]\d|2[0-3]):[0-5]\d$/;
const dateString=z.string().regex(date).refine(value=>{const parsed=new Date(`${value}T00:00:00.000Z`);return !Number.isNaN(parsed.getTime())&&parsed.toISOString().slice(0,10)===value;});
const createSchema=z.object({employeeId:z.string().min(1).nullable().optional(),date:dateString,startTime:z.string().regex(time),endTime:z.string().regex(time),role:z.string().trim().min(1),notes:z.string().trim().nullable().optional(),status:z.enum(['DRAFT','SCHEDULED']).optional()});
const updateSchema=createSchema.partial();const rangeSchema=z.object({startDate:dateString,endDate:dateString}).refine(value=>value.startDate<=value.endDate);
const invalid=(response:Response)=>response.status(400).json({error:{code:'VALIDATION_ERROR',message:'Valid shift details are required.'}});
async function handle(response:Response,action:()=>Promise<unknown>,successStatus=200){try{response.status(successStatus).json({shift:await action()});}catch(error){if(error instanceof ShiftError){response.status(404).json({error:{code:error.code,message:error.message}});return;}if(error instanceof SchedulingError){const status=error.code==='INVALID_SHIFT_TIME'?400:error.code==='EMPLOYEE_NOT_FOUND'?404:409;response.status(status).json({error:{code:error.code,message:error.message}});return;}throw error;}}
export function createShiftRouter(auth:AuthenticationService,service:ShiftService){const router=Router();router.use(authenticate(auth),requireRole('MANAGER'));
  router.get('/',async(request,response)=>{const parsed=rangeSchema.safeParse(request.query);if(!parsed.success){invalid(response);return;}response.json({shifts:await service.list(parsed.data.startDate,parsed.data.endDate)});});
  router.post('/',async(request,response)=>{const parsed=createSchema.safeParse(request.body);if(!parsed.success){invalid(response);return;}const user=(request as AuthenticatedRequest).authUser!;await handle(response,()=>service.create(user.id,parsed.data),201);});
  router.patch('/:id',async(request,response)=>{const parsed=updateSchema.safeParse(request.body);if(!parsed.success){invalid(response);return;}await handle(response,()=>service.update(request.params.id!,parsed.data));});
  router.delete('/:id',async(request,response)=>{await handle(response,()=>service.cancel(request.params.id!));});return router;}
