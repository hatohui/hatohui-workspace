import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '@/config/env';
import { DatabaseModule } from '@/libs/db';
import { RedisModule } from '@/libs/redis';
import { CacheModule } from '@/libs/cache';
import { EmailModule } from '@/libs/email';
import { StorageModule } from '@/libs/storage';
import { FriendsModule } from '@/modules/friends/friends.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { HealthModule } from '@/modules/health/health.module';
import { ImagesModule } from '@/modules/images/images.module';
import { PlatformsModule } from '@/modules/platforms/platforms.module';
import { OnboardingModule } from '@/modules/onboarding/onboarding.module';
import { UsersModule } from '@/modules/users/users.module';
import { AdminModule } from '@/modules/admin/admin.module';
import { ConnectionsModule } from '@/modules/connections/connections.module';
import { CronModule } from '@/modules/cron/cron.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { CommissionsModule } from '@/modules/commissions/commissions.module';
import { CommissionPricingModule } from '@/modules/commission-pricing/commission-pricing.module';
import { ProjectsModule } from '@/modules/projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    RedisModule,
    CacheModule,
    EmailModule,
    StorageModule,
    AuthModule,
    FriendsModule,
    HealthModule,
    ImagesModule,
    PlatformsModule,
    OnboardingModule,
    UsersModule,
    AdminModule,
    ConnectionsModule,
    CronModule,
    NotificationsModule,
    AssetsModule,
    CommissionsModule,
    CommissionPricingModule,
    ProjectsModule,
  ],
})
export class AppModule {}
