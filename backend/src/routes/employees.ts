import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../middleware/auth.js';
import type { AuthenticationService } from '../services/AuthenticationService.js';
import { EmployeeError, type EmployeeService } from '../services/EmployeeService.js';

const createSchema = z.object({ firstName: z.string().trim().min(1), lastName: z.string().trim().min(1), email: z.string().email(), phone: z.string().trim().nullable().optional(), jobTitle: z.string().trim().min(1) });
const updateSchema = createSchema.partial().extend({ status: z.enum(['ACTIVE','INACTIVE']).optional() });

export function createEmployeeRouter(auth: AuthenticationService, service: EmployeeService) {
  const router = Router();
  router.use(authenticate(auth), requireRole('MANAGER'));
  router.get('/', async (_req,res) => res.json({ employees: await service.list() }));
  router.post('/', async (req,res) => { const parsed=createSchema.safeParse(req.body); if(!parsed.success){res.status(400).json({error:{code:'VALIDATION_ERROR',message:'Valid employee details are required.'}});return;} res.status(201).json({employee:await service.create(parsed.data)}); });
  router.get('/:id', async (req,res) => handle(res, () => service.get(req.params.id!)));
  router.patch('/:id', async (req,res) => { const parsed=updateSchema.safeParse(req.body); if(!parsed.success){res.status(400).json({error:{code:'VALIDATION_ERROR',message:'Valid employee details are required.'}});return;} await handle(res, () => service.update(req.params.id!, parsed.data)); });
  router.delete('/:id', async (req,res) => handle(res, () => service.deactivate(req.params.id!)));
  return router;
}

async function handle(res: import('express').Response, action: () => Promise<unknown>) { try { res.json({ employee: await action() }); } catch (error) { if(error instanceof EmployeeError){res.status(404).json({error:{code:error.code,message:error.message}});return;} throw error; } }
