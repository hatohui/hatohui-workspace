import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { RedisClient } from '@/infra/redis';
import { clientIpOf } from '@/common/utils/client-ip';
import type { AuthenticatedRequest } from '@/modules/auth/guards/auth.guard';
import {
  SIGN_RATE_LIMIT_ANONYMOUS,
  SIGN_RATE_LIMIT_AUTHENTICATED,
  SIGN_RATE_LIMIT_KEY_PREFIX,
  SIGN_RATE_LIMIT_WINDOW_SECONDS,
} from '@/modules/images/images.constants';

@Injectable()
export class SignRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(SignRateLimitGuard.name);

  constructor(private readonly redis: RedisClient) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as Partial<AuthenticatedRequest>).user;
    const subject = user ? `user:${user.id}` : `ip:${clientIpOf(request)}`;
    const limit = user
      ? SIGN_RATE_LIMIT_AUTHENTICATED
      : SIGN_RATE_LIMIT_ANONYMOUS;

    const count = await this.increment(
      `${SIGN_RATE_LIMIT_KEY_PREFIX}:${subject}`,
      this.costOf(request),
    );
    if (count !== null && count > limit) {
      throw new HttpException(
        'Too many upload requests, try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }

  private costOf(request: Request): number {
    const files = (request.body as { files?: unknown } | undefined)?.files;
    if (!Array.isArray(files) || files.length === 0) return 1;
    return files.length;
  }

  private async increment(key: string, cost: number): Promise<number | null> {
    try {
      const results = await this.redis
        .multi()
        .set(key, 0, 'EX', SIGN_RATE_LIMIT_WINDOW_SECONDS, 'NX')
        .incrby(key, cost)
        .exec();
      const [error, count] = results?.[1] ?? [];
      if (error) throw error;
      return count as number;
    } catch (error) {
      this.logger.warn(`Rate limit check skipped: ${String(error)}`);
      return null;
    }
  }
}
