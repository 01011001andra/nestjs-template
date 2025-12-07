// src/rbac/role-permission/role-permission.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UpsertRolePermissionDto } from './dto/update-role-permission.dto';

@Injectable()
export class RolePermissionService {
  constructor(private readonly db: DatabaseService) {}

  async getPermissionsByRole(roleName: string) {
    const role = await this.db.role.findUnique({
      where: { name: roleName },
      include: {
        apiPermissions: {
          include: {
            apiResource: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role "${roleName}" not found`);
    }

    const data = {
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
      },
      permissions: role.apiPermissions.map((p) => ({
        id: p.id,
        apiResourceId: p.apiResourceId,
        apiResourceName: p.apiResource.name,
        allow: p.allow,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    };

    return {
      success: true,
      message: null,
      data,
    };
  }

  async upsertPermission(dto: UpsertRolePermissionDto) {
    // 1. cari role
    const role = await this.db.role.findUnique({
      where: { name: dto.roleName },
    });
    if (!role) {
      throw new NotFoundException(`Role "${dto.roleName}" not found`);
    }

    // 2. cari apiResource
    const apiResource = await this.db.apiResource.findUnique({
      where: { name: dto.apiResourceName },
    });
    if (!apiResource) {
      throw new NotFoundException(
        `ApiResource "${dto.apiResourceName}" not found`,
      );
    }

    // 3. upsert RoleApiPermission
    const permission = await this.db.roleApiPermission.upsert({
      where: {
        roleId_apiResourceId: {
          roleId: role.id,
          apiResourceId: apiResource.id,
        },
      },
      update: {
        allow: dto.allow,
      },
      create: {
        roleId: role.id,
        apiResourceId: apiResource.id,
        allow: dto.allow,
      },
    });

    return {
      success: true,
      message: null,
      data: permission,
    };
  }
}
