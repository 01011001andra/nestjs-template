// src/rbac/api-resource/dto/create-api-resource.dto.ts
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { HttpMethod } from 'src/generated/prisma/client'; // sesuaikan path

export class CreateApiResourceDto {
  @IsString()
  name: string; // contoh: "example:create"

  @IsEnum(HttpMethod)
  method: HttpMethod; // GET | POST | ...

  @IsString()
  path: string; // "/example", "/example/:id"

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @IsBoolean()
  isProtected?: boolean; // default true di schema, jadi optional di DTO
}
