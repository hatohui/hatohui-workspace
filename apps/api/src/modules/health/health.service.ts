import { Injectable } from '@nestjs/common';
import { Database } from '@/libs/db';
import { RedisClient } from '@/libs/redis';
import type { DependencyStatus, HealthDto } from './dto/health.dto';

@Injectable()
export class HealthService {
  constructor(
    private readonly db: Database,
    private readonly redis: RedisClient,
  ) {}

  async check(): Promise<HealthDto> {
    const [db, redis] = await Promise.all([this.checkDb(), this.checkRedis()]);
    const status: DependencyStatus =
      db === 'ok' && redis === 'ok' ? 'ok' : 'error';

    return { status, db, redis };
  }

  private async checkDb(): Promise<DependencyStatus> {
    try {
      await this.db.$queryRaw`SELECT 1`;
      return 'ok';
    } catch {
      return 'error';
    }
  }

  private async checkRedis(): Promise<DependencyStatus> {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG' ? 'ok' : 'error';
    } catch {
      return 'error';
    }
  }
}
