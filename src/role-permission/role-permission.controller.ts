// src/rbac/role-permission/role-permission.controller.ts
import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { RolePermissionService } from './role-permission.service';
import { UpsertRolePermissionDto } from './dto/update-role-permission.dto';

@Controller('rbac/role-permissions')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  // contoh: GET /rbac/role-permissions/admin
  @Get(':roleName')
  getByRole(@Param('roleName') roleName: string) {
    return this.rolePermissionService.getPermissionsByRole(roleName);
  }

  // contoh: PATCH /rbac/role-permissions
  // body: { "roleName": "superAdmin", "apiResourceName": "example:create", "allow": true }
  @Patch()
  upsert(@Body() dto: UpsertRolePermissionDto) {
    return this.rolePermissionService.upsertPermission(dto);
  }
}
