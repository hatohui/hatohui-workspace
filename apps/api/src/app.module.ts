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
import { ArtistAboutModule } from '@/modules/artist-about/artist-about.module';
import { ArtistFaqModule } from '@/modules/artist-faq/artist-faq.module';
import { AdminModule } from '@/modules/admin/admin.module';
import { ConnectionsModule } from '@/modules/connections/connections.module';
import { CronModule } from '@/modules/cron/cron.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { AssetProcessModule } from '@/modules/asset-process/asset-process.module';
import { CommissionsModule } from '@/modules/commissions/commissions.module';
import { CommissionTypesModule } from '@/modules/commission-types/commission-types.module';
import { CommissionPricingModule } from '@/modules/commission-pricing/commission-pricing.module';
import { ProjectsModule } from '@/modules/projects/projects.module';
import { CommissionOpeningsModule } from '@/modules/commission-openings/commission-openings.module';
import { ArtistDashboardModule } from '@/modules/artist-dashboard/artist-dashboard.module';
import { CommissionProgressModule } from '@/modules/commission-progress/commission-progress.module';
import { ClientsModule } from '@/modules/clients/clients.module';
import { CommissionFollowersModule } from '@/modules/commission-followers/commission-followers.module';
import { CommissionGroupsModule } from '@/modules/commission-groups/commission-groups.module';
import { CommissionAccessModule } from '@/modules/commission-access/commission-access.module';
import { CommissionAttachmentsModule } from '@/modules/commission-attachments/commission-attachments.module';
import { TravelAccessModule } from '@/modules/travel-access/travel-access.module';
import { TravelCountriesModule } from '@/modules/travel-countries/travel-countries.module';
import { TravelAreasModule } from '@/modules/travel-areas/travel-areas.module';
import { TravelTagsModule } from '@/modules/travel-tags/travel-tags.module';
import { TravelCuisinesModule } from '@/modules/travel-cuisines/travel-cuisines.module';
import { TravelRecommendationsModule } from '@/modules/travel-recommendations/travel-recommendations.module';
import { TravelDishesModule } from '@/modules/travel-dishes/travel-dishes.module';
import { TravelPlacesModule } from '@/modules/travel-places/travel-places.module';
import { AiModule } from '@/modules/ai/ai.module';

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
    ArtistAboutModule,
    ArtistFaqModule,
    AdminModule,
    ConnectionsModule,
    CronModule,
    NotificationsModule,
    AssetsModule,
    AssetProcessModule,
    CommissionsModule,
    CommissionTypesModule,
    CommissionPricingModule,
    ProjectsModule,
    CommissionOpeningsModule,
    ArtistDashboardModule,
    CommissionProgressModule,
    ClientsModule,
    CommissionFollowersModule,
    CommissionGroupsModule,
    CommissionAccessModule,
    CommissionAttachmentsModule,
    TravelAccessModule,
    TravelCountriesModule,
    TravelAreasModule,
    TravelTagsModule,
    TravelCuisinesModule,
    TravelRecommendationsModule,
    TravelDishesModule,
    TravelPlacesModule,
    AiModule,
  ],
})
export class AppModule {}
