// src/auth/auth.controller.ts
import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import {
  AllowAnonymous,
  OptionalAuth,
  Session,
  UserSession,
} from '@thallesp/nestjs-better-auth';
import type { Request, Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @AllowAnonymous()
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('signin')
  @AllowAnonymous()
  signIn(
    @Req() req: Request,
    @Res({ passthrough: true }) res: ExpressResponse,
    @Body() dto: SignInDto,
  ) {
    return this.authService.signIn(req, res, dto);
  }

  @Get('me')
  getProfile(@Session() session: UserSession) {
    return this.authService.getProfile(session);
  }

  @Get('optional')
  @OptionalAuth()
  getOptional(@Session() session: UserSession | null) {
    return this.authService.getOptional(session);
  }

  @Get('public')
  @AllowAnonymous()
  getPublic() {
    return this.authService.getPublic();
  }
}
