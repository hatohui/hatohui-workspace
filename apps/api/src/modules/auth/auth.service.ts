import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { Database } from '@/libs/db';
import type { Env } from '@/config/env';
import { AppScope, Role, type User } from '@prisma/client';

const ADMIN_EMAIL_CONFIG_TYPE = 'admin.email';

@Injectable()
export class AuthService {
  private readonly client: OAuth2Client;

  constructor(
    private readonly db: Database,
    private readonly config: ConfigService<Env, true>,
  ) {
    this.client = new OAuth2Client(
      this.config.get('GOOGLE_OAUTH_CLIENT_ID', { infer: true }),
      this.config.get('GOOGLE_OAUTH_CLIENT_SECRET', { infer: true }),
    );
  }

  async loginWithGoogle(code: string): Promise<User> {
    const exchange = await this.client
      .getToken({ code, redirect_uri: 'postmessage' })
      .catch(() => null);

    const idToken = exchange?.tokens.id_token;
    if (!idToken) {
      throw new UnauthorizedException('Invalid Google authorization code');
    }

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

    const adminEmailConfig = await this.db.appConfig.findUnique({
      where: {
        type_scope: { type: ADMIN_EMAIL_CONFIG_TYPE, scope: AppScope.ALL },
      },
    });
    const role: Role =
      adminEmailConfig?.value === payload.email ? Role.ADMIN : Role.MEMBER;

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
