import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '@/config/env';
import { DatabaseModule } from '@/libs/db';
import { RedisModule } from '@/libs/redis';
import { EmailModule } from '@/libs/email';
import { StorageModule } from '@/libs/storage';
import { MessagesModule } from '@/modules/messages/messages.module';
import { FriendsModule } from '@/modules/friends/friends.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { HealthModule } from '@/modules/health/health.module';
import { ImagesModule } from '@/modules/images/images.module';
import { PlatformsModule } from '@/modules/platforms/platforms.module';
import { OnboardingModule } from '@/modules/onboarding/onboarding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    RedisModule,
    EmailModule,
    StorageModule,
    AuthModule,
    MessagesModule,
    FriendsModule,
    HealthModule,
    ImagesModule,
    PlatformsModule,
    OnboardingModule,
  ],
})
export class AppModule {}
