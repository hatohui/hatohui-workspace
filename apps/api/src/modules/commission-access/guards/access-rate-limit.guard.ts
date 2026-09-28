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
import {
  ACCESS_RATE_LIMIT_ATTEMPTS,
  ACCESS_RATE_LIMIT_KEY_PREFIX,
  ACCESS_RATE_LIMIT_WINDOW_SECONDS,
} from '@/modules/commission-access/commission-access.constants';

@Injectable()
export class AccessRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(AccessRateLimitGuard.name);

  constructor(private readonly redis: RedisClient) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const count = await this.increment(
      `${ACCESS_RATE_LIMIT_KEY_PREFIX}:ip:${clientIpOf(request)}`,
    );
    if (count !== null && count > ACCESS_RATE_LIMIT_ATTEMPTS) {
      throw new HttpException(
        'Too many passcode attempts, try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }

  private async increment(key: string): Promise<number | null> {
    try {
      const results = await this.redis
        .multi()
        .set(key, 0, 'EX', ACCESS_RATE_LIMIT_WINDOW_SECONDS, 'NX')
        .incr(key)
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
