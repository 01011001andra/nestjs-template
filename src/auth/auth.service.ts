// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import type { Request, Response as ExpressResponse } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from 'src/lib/auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  async signUp(body: SignUpDto) {
    const { user } = await auth.api.createUser({
      body: {
        email: body.email,
        password: body.password,
        name: body.email,
        role: body.role as 'admin',
      },
    });

    // data yang umum dipakai
    return {
      user,
    };
  }
  async signIn(req: Request, res: ExpressResponse, body: SignInDto) {
    const {
      response: { user },
      headers,
    } = await auth.api.signInEmail({
      body,
      headers: fromNodeHeaders(req.headers),
      returnHeaders: true,
    });

    // teruskan cookie session ke client
    const setCookie = headers.get('set-cookie');
    if (setCookie) {
      res.setHeader('set-cookie', setCookie);
    }

    return {
      user,
    };
  }

  getProfile(session: UserSession) {
    return {
      user: session.user,
    };
  }

  getOptional(session: UserSession | null) {
    return {
      authenticated: !!session,
      user: session?.user ?? null,
    };
  }

  getPublic() {
    return {
      message: 'Public route',
    };
  }
}
