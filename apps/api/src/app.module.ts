import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '@/config/env';
import { DatabaseModule } from '@/infra/db';
import { RedisModule } from '@/infra/redis';
import { CacheModule } from '@/infra/cache';
import { EmailModule } from '@/infra/email';
import { StorageModule } from '@/infra/storage';
import { BirthdaysModule } from '@/modules/birthdays/birthdays.module';
import { SocialGraphModule } from '@/modules/social-graph/social-graph.module';
import { ProfilesModule } from '@/modules/profiles/profiles.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { HealthModule } from '@/modules/health/health.module';
import { ImagesModule } from '@/modules/images/images.module';
import { SocialPlatformsModule } from '@/modules/social-platforms/social-platforms.module';
import { OnboardingModule } from '@/modules/onboarding/onboarding.module';
import { UsersModule } from '@/modules/users/users.module';
import { ArtistsModule } from '@/modules/artists/artists.module';
import { AdminModule } from '@/modules/admin/admin.module';
import { ConnectionsModule } from '@/modules/connections/connections.module';
import { CronModule } from '@/modules/cron/cron.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { CommissionsModule } from '@/modules/commissions/commissions.module';
import { CommissionTypesModule } from '@/modules/commission-types/commission-types.module';
import { CommissionPricingModule } from '@/modules/commission-pricing/commission-pricing.module';
import { ProjectsModule } from '@/modules/projects/projects.module';
import { CommissionOpeningsModule } from '@/modules/commission-openings/commission-openings.module';
import { CommissionProgressModule } from '@/modules/commission-progress/commission-progress.module';
import { ClientsModule } from '@/modules/clients/clients.module';
import { CommissionFollowersModule } from '@/modules/commission-followers/commission-followers.module';
import { CommissionGroupsModule } from '@/modules/commission-groups/commission-groups.module';
import { PaymentMethodsModule } from '@/modules/payment-methods/payment-methods.module';

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
    /// Order matters — see docs/specs/api/friends-controllers/README.md
    BirthdaysModule,
    SocialGraphModule,
    ProfilesModule,
    HealthModule,
    ImagesModule,
    SocialPlatformsModule,
    OnboardingModule,
    UsersModule,
    ArtistsModule,
    AdminModule,
    ConnectionsModule,
    CronModule,
    NotificationsModule,
    AssetsModule,
    CommissionsModule,
    CommissionTypesModule,
    CommissionPricingModule,
    ProjectsModule,
    CommissionOpeningsModule,
    CommissionProgressModule,
    ClientsModule,
    CommissionFollowersModule,
    CommissionGroupsModule,
    PaymentMethodsModule,
  ],
})
export class AppModule {}
