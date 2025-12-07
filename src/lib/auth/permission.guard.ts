// auth/permissions.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RESOURCE_KEY } from './resource.decorator';
import { ACTION_KEY } from './permission-action.decorator';
import { AuthRequest } from './rbac.type';
import { auth } from './auth';

type Action = 'create' | 'read' | 'update' | 'delete';

const methodToAction: Partial<Record<string, Action>> = {
  GET: 'read',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const clazz = context.getClass();

    // 1. cek dulu: route ini ada @Resource nggak?
    const resource =
      this.reflector.get<string | undefined>(RESOURCE_KEY, handler) ??
      this.reflector.get<string | undefined>(RESOURCE_KEY, clazz);

    if (!resource) {
      // nggak ada @Resource → guard ini skip
      return true;
    }

    const req = context.switchToHttp().getRequest<AuthRequest>();

    // 2. ambil session dari req (diisi sama AuthGuard nestjs-better-auth)
    const session = req.session;
    const sessionUser = session?.user;

    if (!sessionUser) {
      throw new UnauthorizedException('User not authenticated');
    }

    const role = sessionUser.role as 'user' | 'admin' | 'superAdmin';

    if (!role) {
      throw new ForbiddenException('User has no role');
    }

    // 3. Tentukan action:
    //    - kalau ada @PermissionAction di handler / class → pakai itu
    //    - kalau tidak → fallback dari HTTP method
    const customAction =
      this.reflector.get<string | undefined>(ACTION_KEY, handler) ??
      this.reflector.get<string | undefined>(ACTION_KEY, clazz);

    const method = req.method.toUpperCase();
    const fallbackAction = methodToAction[method];

    const action = customAction ?? fallbackAction;
    // console.log({ resource, method, customAction, action });

    if (!action) {
      // OPTIONS / HEAD dll → lewati saja
      return true;
    }

    // 4. Call Better Auth: userHasPermission BERDASARKAN ROLE
    const result = await auth.api.userHasPermission({
      body: {
        role, // "user" | "admin" | "superAdmin"
        permissions: {
          [resource]: [action], // contoh: { example: ["create"] } atau { example: ["specialCreate"] }
        },
      },
    });

    if (!result.success) {
      throw new ForbiddenException('No permission');
    }

    return true;
  }
}
