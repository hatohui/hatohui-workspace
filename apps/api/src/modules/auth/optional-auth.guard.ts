import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { Database } from '@/libs/db';
import { SESSION_COOKIE_NAME, SessionService } from './session.service';
import type { AuthenticatedRequest } from './auth.guard';

/// Attaches `request.user` when a valid session cookie is present, but never
/// throws — for endpoints that behave differently for logged-in vs anonymous
/// callers without requiring login (e.g. visibility-filtered friend lists).
@Injectable()
export class OptionalAuthGuard implements CanActivate {
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
    if (payload) {
      const user = await this.db.user.findUnique({
        where: { id: payload.sub },
      });
      if (user) {
        (request as AuthenticatedRequest).user = user;
      }
    }
    return true;
  }
}
