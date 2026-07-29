import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { Database } from '@/libs/db';
import type { Env } from '@/config/env';
import { Role, type User } from '@prisma/client';

const APP_CONFIG_SINGLETON_ID = 'singleton';

@Injectable()
export class AuthService {
  private readonly client: OAuth2Client;

  constructor(
    private readonly db: Database,
    private readonly config: ConfigService<Env, true>,
  ) {
    this.client = new OAuth2Client(
      this.config.get('GOOGLE_OAUTH_CLIENT_ID', { infer: true }),
    );
  }

  async loginWithGoogle(idToken: string): Promise<User> {
    const ticket = await this.client
      .verifyIdToken({
        idToken,
        audience: this.config.get('GOOGLE_OAUTH_CLIENT_ID', { infer: true }),
      })
      .catch(() => null);

    const payload = ticket?.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    const appConfig = await this.db.appConfig.findUnique({
      where: { id: APP_CONFIG_SINGLETON_ID },
    });
    const role: Role =
      appConfig?.adminEmail === payload.email ? Role.ADMIN : Role.MEMBER;

    return this.db.user.upsert({
      where: { googleId: payload.sub },
      create: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name ?? payload.email,
        avatarUrl: payload.picture ?? null,
        role,
      },
      update: {
        email: payload.email,
        name: payload.name ?? payload.email,
        avatarUrl: payload.picture ?? null,
        role,
      },
    });
  }
}
