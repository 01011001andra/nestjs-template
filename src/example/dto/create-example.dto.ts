// src/example/dto/create-example.dto.ts
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateExampleDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
