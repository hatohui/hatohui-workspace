import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { Env } from '@/config/env';
import { ADMIN_KEY_HEADER, adminKeyMatches } from '@/libs/admin-key';

@Injectable()
export class CronGuard implements CanActivate {
  constructor(private readonly config: ConfigService<Env, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const expected = this.config.get('ADMIN_API_KEY', { infer: true });

    if (!adminKeyMatches(request.headers[ADMIN_KEY_HEADER], expected)) {
      throw new ForbiddenException('Cron access denied');
    }

    return true;
  }
}
