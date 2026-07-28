import {
  Global,
  Injectable,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisClient
  extends Redis
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super(process.env.REDIS_URL as string, { lazyConnect: true });
  }

  onModuleInit() {
    return this.connect();
  }

  onModuleDestroy() {
    this.disconnect();
  }
}

@Global()
@Module({
  providers: [RedisClient],
  exports: [RedisClient],
})
export class RedisModule {}
