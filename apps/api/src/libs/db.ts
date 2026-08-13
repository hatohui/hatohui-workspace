import {
  Global,
  Injectable,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class Database
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
  }

  onModuleInit() {
    return this.$connect();
  }

  onModuleDestroy() {
    return this.$disconnect();
  }
}

/// The client type handed to a `db.$transaction(async (tx) => ...)`
/// callback — lacks the connection-lifecycle methods since those only make
/// sense on the top-level client. Useful for typing helpers that need to
/// participate in a caller's transaction (e.g. AvatarsService).
export type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$use' | '$extends'
>;

@Global()
@Module({
  providers: [Database],
  exports: [Database],
})
export class DatabaseModule {}
