import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../middleware/auth.js';
import type { AuthenticationService } from '../services/AuthenticationService.js';
import type { DashboardService } from '../services/DashboardService.js';

const date = z.string().date();
const query = z.object({ today: date, weekStart: date });

export function createDashboardRouter(auth: AuthenticationService, service: DashboardService) {
  const router = Router();
  router.use(authenticate(auth), requireRole('MANAGER'));
  router.get('/', async (req, res) => {
    const parsed = query.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Valid today and weekStart values are required.' },
      });
      return;
    }
    res.json({ dashboard: await service.summary(parsed.data.today, parsed.data.weekStart) });
  });
  return router;
}
