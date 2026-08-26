import { Global, Injectable, Module } from '@nestjs/common';
import { RedisClient } from './redis';

export const CACHE_KEYS = {
  userRoles: (userId: string) => `auth:roles:${userId}`,
  systemParametersList: () => 'admin:system-parameters:list',
  birthdaysList: () => 'friends:birthdays:list',
  connectionContext: (userId: string) => `conn:ctx:${userId}`,
  unreadNotifications: (userId: string) => `notif:unread:${userId}`,
} as const;

@Injectable()
export class Cache {
  constructor(private readonly redis: RedisClient) {}

  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    load: () => Promise<T>,
  ): Promise<T> {
    try {
      const hit = await this.redis.get(key);
      if (hit !== null) return JSON.parse(hit) as T;
    } catch {
      return load();
    }

    const value = await load();
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // Losing the write just means the next read reloads.
    }
    return value;
  }

  async invalidate(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      await this.redis.del(...keys);
    } catch {
      // A failed delete would serve staleness for at most the TTL.
    }
  }
}

@Global()
@Module({
  providers: [Cache],
  exports: [Cache],
})
export class CacheModule {}
