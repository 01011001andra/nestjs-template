// auth/rbac.type.ts
import type { Request } from 'express';
import type { UserSession } from '@thallesp/nestjs-better-auth';

export interface AuthRequest extends Request {
  session?: UserSession;
  user?: UserSession['user'];
}
