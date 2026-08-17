import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { Database } from '@/infra/db';
import { SessionService } from '@/modules/auth/services/session.service';
import { SESSION_COOKIE_NAME } from '@/modules/auth/auth.constants';
import type { User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user: User;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly session: SessionService,
    private readonly db: Database,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = (request.cookies as Record<string, string> | undefined)?.[
      SESSION_COOKIE_NAME
    ];
    const payload = token ? this.session.verify(token) : null;
    if (!payload) {
      throw new UnauthorizedException('Not authenticated');
    }

    const user = await this.db.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    (request as AuthenticatedRequest).user = user;
    return true;
  }
}
