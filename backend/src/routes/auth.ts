import { Router } from 'express';
import { z } from 'zod';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import { AuthenticationError, type AuthenticationService } from '../services/AuthenticationService.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createAuthRouter = (service: AuthenticationService) => {
  const router = Router();
  router.post('/login', async (request, response) => {
    const input = loginSchema.safeParse(request.body);
    if (!input.success) {
      response.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'A valid email and password are required.' } });
      return;
    }
    try {
      response.json(await service.login(input.data.email, input.data.password));
    } catch (caught) {
      if (caught instanceof AuthenticationError) {
        response.status(401).json({ error: { code: caught.code, message: caught.message } });
        return;
      }
      throw caught;
    }
  });
  router.get('/me', authenticate(service), (request, response) => response.json({ user: (request as AuthenticatedRequest).authUser }));
  return router;
};
