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
import { SessionService } from '@/modules/auth/services/session.service';
import { TravelAccessService } from '@/modules/travel-access/services/travel-access.service';

@Injectable()
export class TravelEditorGuard extends AuthGuard implements CanActivate {
  constructor(
    session: SessionService,
    db: Database,
    private readonly access: TravelAccessService,
  ) {
    super(session, db);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!(await this.access.canEdit(request.user))) {
      throw new ForbiddenException('Travel editor access denied');
    }
    return true;
  }
}
