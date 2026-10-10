import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { AuthenticationService, SafeUser, UserRole } from '../services/AuthenticationService.js';

export type AuthenticatedRequest = Request & { authUser?: SafeUser };

const error = (response: Response, status: number, code: string, message: string) =>
  response.status(status).json({ error: { code, message } });

export const authenticate = (service: AuthenticationService): RequestHandler =>
  async (request: Request, response: Response, next: NextFunction) => {
    const [scheme, token] = request.header('Authorization')?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) {
      error(response, 401, 'UNAUTHENTICATED', 'Authentication is required.');
      return;
    }
    try {
      (request as AuthenticatedRequest).authUser = await service.getCurrentUser(token);
      next();
    } catch {
      error(response, 401, 'UNAUTHENTICATED', 'Authentication is required.');
    }
  };

export const requireRole = (...roles: UserRole[]): RequestHandler =>
  (request, response, next) => {
    const user = (request as AuthenticatedRequest).authUser;
    if (!user || !roles.includes(user.role)) {
      error(response, 403, 'FORBIDDEN', 'You do not have permission to perform this action.');
      return;
    }
    next();
  };
