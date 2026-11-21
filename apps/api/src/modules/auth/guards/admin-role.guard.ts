import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Database } from '@/infra/db';
import {
  AuthGuard,
  type AuthenticatedRequest,
} from '@/modules/auth/guards/auth.guard';
import { AuthService } from '@/modules/auth/services/auth.service';
import { SessionService } from '@/modules/auth/services/session.service';

@Injectable()
export class AdminRoleGuard extends AuthGuard implements CanActivate {
  constructor(
    session: SessionService,
    db: Database,
    private readonly auth: AuthService,
  ) {
    super(session, db);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!(await this.auth.isAdmin(request.user))) {
      throw new ForbiddenException('Admin access denied');
    }
    return true;
  }
}
