import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import type { Env } from '@/config/env';
import { Database } from '@/libs/db';
import {
  AuthGuard,
  type AuthenticatedRequest,
} from '@/modules/auth/auth.guard';
import { AuthService } from '@/modules/auth/auth.service';
import { SessionService } from '@/modules/auth/session.service';

export const ADMIN_KEY_HEADER = 'x-admin-key';

/// Two independent factors: the session must belong to the configured admin
/// address, *and* the request must carry the admin key — so a stolen session
/// cookie alone gets nowhere. Extends AuthGuard so it also populates
/// `request.user`.
@Injectable()
export class AdminGuard extends AuthGuard implements CanActivate {
  constructor(
    session: SessionService,
    db: Database,
    private readonly auth: AuthService,
    private readonly config: ConfigService<Env, true>,
  ) {
    super(session, db);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const provided = request.headers[ADMIN_KEY_HEADER];
    const expected = this.config.get('ADMIN_API_KEY', { infer: true });
    if (typeof provided !== 'string' || !matches(provided, expected)) {
      throw new ForbiddenException('Admin access denied');
    }

    if (!(await this.auth.isAdmin(request.user))) {
      throw new ForbiddenException('Admin access denied');
    }

    return true;
  }
}

/// Constant-time compare so a wrong key can't be discovered byte by byte.
/// Lengths are compared first because timingSafeEqual throws on a mismatch.
function matches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
