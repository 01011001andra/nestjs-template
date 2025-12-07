// src/auth/rbac.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from 'src/database/database.service';
import { PERMISSION_KEY } from './permission.decorator';
import { AuthRequest } from './rbac.type';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Ambil nama permission dari decorator
    const permissionName = this.reflector.get<string | undefined>(
      PERMISSION_KEY,
      context.getHandler(),
    );

    // Kalau route ini tidak pakai @Permission, lepasin saja
    if (!permissionName) return true;

    const req = context.switchToHttp().getRequest<AuthRequest>();
    const sessionUser = req.session?.user;

    if (!sessionUser) {
      throw new UnauthorizedException('User not authenticated');
    }

    const userId = sessionUser.id;

    // 2. Cari ApiResource berdasarkan name di DB
    const apiResource = await this.prisma.apiResource.findUnique({
      where: { name: permissionName },
    });

    if (!apiResource) {
      // kamu bisa pilih: auto create atau block
      throw new ForbiddenException('API resource not registered');
    }

    const apiResourceId = apiResource.id;

    // 3. Cek override per user dulu (UserApiPermission)
    const userPermission = await this.prisma.userApiPermission.findUnique({
      where: {
        userId_apiResourceId: {
          userId,
          apiResourceId,
        },
      },
    });

    if (userPermission) {
      if (!userPermission.allow) {
        throw new ForbiddenException('Access denied (user override)');
      }
      return true; // user override allow
    }

    // 4. Kalau tidak ada override, cek via Role
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            apiPermissions: {
              where: { apiResourceId },
            },
          },
        },
      },
    });

    const isAllowedByRole = userRoles.some((ur) =>
      ur.role.apiPermissions.some((p) => p.allow),
    );

    if (!isAllowedByRole) {
      throw new ForbiddenException('Access denied (role based)');
    }

    return true;
  }
}
