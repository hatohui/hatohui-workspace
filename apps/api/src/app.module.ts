import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '@/config/env';
import { DatabaseModule } from '@/libs/db';
import { MessagesModule } from '@/modules/messages/messages.module';
import { FriendsModule } from '@/modules/friends/friends.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    MessagesModule,
    FriendsModule,
  ],
})
export class AppModule {}
