import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '@/config/env';
import { ADMIN_KEY_HEADER, adminKeyMatches } from '@/common/utils/admin-key';
import { Database } from '@/infra/db';
import {
  AuthGuard,
  type AuthenticatedRequest,
} from '@/modules/auth/guards/auth.guard';
import { AuthService } from '@/modules/auth/services/auth.service';
import { SessionService } from '@/modules/auth/services/session.service';

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

    const expected = this.config.get('ADMIN_API_KEY', { infer: true });
    if (!adminKeyMatches(request.headers[ADMIN_KEY_HEADER], expected)) {
      throw new ForbiddenException('Admin access denied');
    }

    if (!(await this.auth.isAdmin(request.user))) {
      throw new ForbiddenException('Admin access denied');
    }

    return true;
  }
}
