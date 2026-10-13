import { Router, type Response } from 'express';
import { z } from 'zod';
import {
  authenticate,
  requireRole,
  type AuthenticatedRequest,
} from '../middleware/auth.js';
import type { AuthenticationService } from '../services/AuthenticationService.js';
import {
  ProposalError,
  type ShiftOpsProposalService,
} from '../shiftops/ShiftOpsProposalService.js';

type ProposalActions = Pick<
  ShiftOpsProposalService,
  'createIncident' | 'createProposal' | 'approve' | 'reject' | 'apply' | 'get' | 'listAudit'
>;

const incidentInput = z.object({
  shiftId: z.string().trim().min(1),
  reason: z.string().trim().min(1).max(200),
});
const proposalInput = z.object({
  incidentId: z.string().trim().min(1),
  replacementEmployeeId: z.string().trim().min(1),
});

const fail = (response: Response, error: ProposalError) => {
  const notFound = ['SHIFT_NOT_FOUND', 'INCIDENT_NOT_FOUND', 'PROPOSAL_NOT_FOUND'].includes(error.code);
  response.status(notFound ? 404 : 409).json({ error: { code: error.code, message: error.message } });
};

async function handle(
  response: Response,
  action: () => Promise<unknown>,
  key: 'incident' | 'proposal',
  status = 200,
) {
  try {
    response.status(status).json({ [key]: await action() });
  } catch (error) {
    if (error instanceof ProposalError) {
      fail(response, error);
      return;
    }
    throw error;
  }
}

export function createShiftOpsProposalRouter(
  auth: AuthenticationService,
  service: ProposalActions,
) {
  const router = Router();
  router.use(authenticate(auth), requireRole('MANAGER'));

  router.post('/incidents', async (request, response) => {
    const parsed = incidentInput.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Valid incident details are required.' } });
      return;
    }
    const actorId = (request as AuthenticatedRequest).authUser!.id;
    await handle(response, () => service.createIncident(actorId, parsed.data.shiftId, parsed.data.reason), 'incident', 201);
  });

  router.post('/proposals', async (request, response) => {
    const parsed = proposalInput.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Valid proposal details are required.' } });
      return;
    }
    const actorId = (request as AuthenticatedRequest).authUser!.id;
    await handle(response, () => service.createProposal(
      actorId,
      parsed.data.incidentId,
      parsed.data.replacementEmployeeId,
    ), 'proposal', 201);
  });

  router.post('/proposals/:id/approve', async (request, response) => {
    const actorId = (request as AuthenticatedRequest).authUser!.id;
    await handle(response, () => service.approve(String(request.params.id), actorId), 'proposal');
  });

  router.post('/proposals/:id/reject', async (request, response) => {
    const actorId = (request as AuthenticatedRequest).authUser!.id;
    await handle(response, () => service.reject(String(request.params.id), actorId), 'proposal');
  });

  router.post('/proposals/:id/apply', async (request, response) => {
    const actorId = (request as AuthenticatedRequest).authUser!.id;
    await handle(response, () => service.apply(String(request.params.id), actorId), 'proposal');
  });

  router.get('/proposals/:id', async (request, response) => {
    await handle(response, () => service.get(String(request.params.id)), 'proposal');
  });

  router.get('/audit', async (_request, response) => {
    response.json({ auditEvents: await service.listAudit() });
  });

  return router;
}
