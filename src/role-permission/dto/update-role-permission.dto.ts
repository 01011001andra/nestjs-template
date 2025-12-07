// src/rbac/role-permission/dto/update-role-permission.dto.ts
import { IsBoolean, IsString } from 'class-validator';

export class UpsertRolePermissionDto {
  @IsString()
  roleName: string; // "user" | "admin" | "superAdmin"

  @IsString()
  apiResourceName: string; // "example:create" dll

  @IsBoolean()
  allow: boolean;
}
