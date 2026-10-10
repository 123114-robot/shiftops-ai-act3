import { Router } from 'express';

export const shiftOpsHealthRouter = Router();

shiftOpsHealthRouter.get('/', (_request, response) => {
  response.json({ status: 'ok', service: 'shiftops-api', phase: 0 });
});
