import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, verify } from 'jsonwebtoken';
import type { CookieOptions } from 'express';
import type { Env } from '@/config/env';
import { SESSION_TTL_SECONDS } from '@/modules/auth/auth.constants';

interface SessionPayload {
  sub: string;
}

@Injectable()
export class SessionService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  sign(userId: string): string {
    const secret: string = this.config.get('SESSION_JWT_SECRET', {
      infer: true,
    });
    return sign({ sub: userId }, secret, { expiresIn: SESSION_TTL_SECONDS });
  }

  verify(token: string): SessionPayload | null {
    try {
      return verify(
        token,
        this.config.get('SESSION_JWT_SECRET', { infer: true }),
      ) as SessionPayload;
    } catch {
      return null;
    }
  }

  cookieOptions(): CookieOptions {
    const domain = this.config.get('SESSION_COOKIE_DOMAIN', { infer: true });
    const isProduction = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      domain,
      maxAge: SESSION_TTL_SECONDS * 1000,
      path: '/',
    };
  }
}
