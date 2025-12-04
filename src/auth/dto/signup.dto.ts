// src/auth/dto/signup.dto.ts

import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsUrl,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  name: string;

  @IsEmail({}, { message: 'Email tidak valid' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password: string;

  @IsOptional()
  @IsUrl({}, { message: 'Format URL tidak valid' })
  image?: string;

  @IsOptional()
  @IsString()
  callbackURL?: string;
}
