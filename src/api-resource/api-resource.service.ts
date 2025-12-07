// src/rbac/api-resource/api-resource.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateApiResourceDto } from './dto/create-api-resource.dto';
import { UpdateApiResourceDto } from './dto/update-api-resource.dto';

type GroupedApiResource<T> = {
  group: string;
  data: T[];
};

@Injectable()
export class ApiResourceService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateApiResourceDto) {
    const created = await this.db.apiResource.create({
      data: {
        name: dto.name,
        method: dto.method,
        path: dto.path,
        description: dto.description,
        isProtected: dto.isProtected ?? true,
        group: dto.group,
      },
    });

    return {
      success: true,
      message: null,
      data: created,
    };
  }

  async findAll() {
    const roles = await this.db.role.findMany({
      select: { id: true, name: true },
    });

    const list = await this.db.apiResource.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        method: true,
        description: true,
        group: true,
        isProtected: true,
        rolePermissions: {
          select: {
            allow: true,
            role: { select: { id: true, name: true } },
          },
        },
      },
    });

    // ==========================================
    // Tambah default allow = false per role
    // ==========================================
    const endpointsWithPermissions = list.map((endpoint) => {
      const permissionsPerRole = roles.map((role) => {
        const found = endpoint.rolePermissions.find(
          (p) => p.role.id === role.id,
        );

        return {
          roleId: role.id,
          roleName: role.name,
          allow: found ? found.allow : false,
        };
      });

      return {
        ...endpoint,
        rolePermissions: permissionsPerRole,
      };
    });

    // ==========================================
    // Grouping (versi simpel dengan reduce)
    // ==========================================
    const groupedObj = endpointsWithPermissions.reduce(
      (acc, endpoint) => {
        const groupKey = String(endpoint.group || 'others');

        if (!acc[groupKey]) {
          acc[groupKey] = {
            group: groupKey,
            data: [],
          };
        }

        acc[groupKey].data.push(endpoint);
        return acc;
      },
      {} as Record<string, GroupedApiResource<any>>,
    );

    const grouped = Object.values(groupedObj);

    return {
      success: true,
      message: null,
      data: {
        endpoints: grouped,
        roles,
      },
    };
  }

  async findOne(id: string) {
    const resource = await this.db.apiResource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException(`ApiResource with id "${id}" not found`);
    }

    return {
      success: true,
      message: null,
      data: resource,
    };
  }

  async update(id: string, dto: UpdateApiResourceDto) {
    await this.findOne(id);

    const updated = await this.db.apiResource.update({
      where: { id },
      data: dto,
    });

    return {
      success: true,
      message: null,
      data: updated,
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.db.apiResource.delete({ where: { id } });

    return {
      success: true,
      message: null,
      data: { id },
    };
  }
}
