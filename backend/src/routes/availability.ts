import { Router, type Response } from 'express';
import { z } from 'zod';
import { authenticate, requireRole, type AuthenticatedRequest } from '../middleware/auth.js';
import type { AuthenticationService } from '../services/AuthenticationService.js';
import { AvailabilityError, type AvailabilityService, daysOfWeek } from '../services/AvailabilityService.js';

const time = /^([01]\d|2[0-3]):[0-5]\d$/;
const entrySchema = z.object({
  dayOfWeek: z.enum(daysOfWeek),
  startTime: z.string().regex(time).nullable(),
  endTime: z.string().regex(time).nullable(),
  isAvailable: z.boolean(),
}).superRefine((entry, context) => {
  if (entry.isAvailable && (!entry.startTime || !entry.endTime || entry.startTime >= entry.endTime)) {
    context.addIssue({ code: 'custom', message: 'Available days require a valid start and end time.' });
  }
  if (!entry.isAvailable && (entry.startTime !== null || entry.endTime !== null)) {
    context.addIssue({ code: 'custom', message: 'Unavailable days cannot include times.' });
  }
});
const weekSchema = z.object({ availability: z.array(entrySchema).length(7) }).superRefine(({ availability }, context) => {
  if (new Set(availability.map((entry) => entry.dayOfWeek)).size !== daysOfWeek.length) {
    context.addIssue({ code: 'custom', path: ['availability'], message: 'Each day of the week must appear once.' });
  }
});

const validationError = (response: Response) => response.status(400).json({
  error: { code: 'VALIDATION_ERROR', message: 'A complete and valid recurring week is required.' },
});

async function handleRead(response: Response, action: () => Promise<unknown>) {
  try {
    response.json({ availability: await action() });
  } catch (error) {
    if (error instanceof AvailabilityError) {
      response.status(404).json({ error: { code: error.code, message: error.message } });
      return;
    }
    throw error;
  }
}

export function createAvailabilityRouter(auth: AuthenticationService, service: AvailabilityService) {
  const router = Router();
  router.use(authenticate(auth), requireRole('EMPLOYEE'));
  router.get('/me', async (request, response) => {
    const employeeId = (request as AuthenticatedRequest).authUser?.employeeId;
    if (!employeeId) { response.status(403).json({ error: { code: 'FORBIDDEN', message: 'An employee profile is required.' } }); return; }
    await handleRead(response, () => service.getForEmployee(employeeId));
  });
  router.put('/me', async (request, response) => {
    const employeeId = (request as AuthenticatedRequest).authUser?.employeeId;
    if (!employeeId) { response.status(403).json({ error: { code: 'FORBIDDEN', message: 'An employee profile is required.' } }); return; }
    const parsed = weekSchema.safeParse(request.body);
    if (!parsed.success) { validationError(response); return; }
    await handleRead(response, () => service.replaceOwnWeek(employeeId, parsed.data.availability));
  });
  return router;
}

export function createManagerAvailabilityRouter(auth: AuthenticationService, service: AvailabilityService) {
  const router = Router();
  router.use(authenticate(auth), requireRole('MANAGER'));
  router.get('/:id/availability', async (request, response) => {
    await handleRead(response, () => service.getForEmployee(request.params.id!));
  });
  return router;
}
