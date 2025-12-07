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

    // 2. Ambil role dari session (Better Auth)
    // pastikan Better Auth memang mengisi user.role (additionalFields -> field prisma "role")
    const roleName = sessionUser.role as string | undefined;

    if (!roleName) {
      throw new ForbiddenException('User has no role');
    }

    // 3. Cari ApiResource berdasarkan name di DB
    const apiResource = await this.prisma.apiResource.findUnique({
      where: { name: permissionName },
    });

    if (!apiResource) {
      // bisa juga auto-create di sini kalau mau
      throw new ForbiddenException('API resource not registered');
    }

    const apiResourceId = apiResource.id;

    if (apiResource?.isProtected) {
      // 4. Cek via Role SAJA (tanpa user override)
      const role = await this.prisma.role.findUnique({
        where: { name: roleName },
        include: {
          apiPermissions: {
            where: {
              apiResourceId,
              allow: true,
            },
          },
        },
      });

      if (!role || role.apiPermissions.length === 0) {
        throw new ForbiddenException('Access denied (role based)');
      }
    }

    return true;
  }
}
