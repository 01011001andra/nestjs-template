// src/example/dto/create-example.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateExampleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
