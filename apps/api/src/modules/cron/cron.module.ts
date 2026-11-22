import { Module } from '@nestjs/common';
import { ConnectionsModule } from '@/modules/connections/connections.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { ProcessQueueModule } from '@/modules/process-queue/process-queue.module';
import { AssetThumbnailExecutor } from '@/modules/assets/services/asset-thumbnail-executor.service';
import { NotificationEmailExecutor } from '@/modules/notifications/services/notification-email.executor';
import { StorageCleanupModule } from '@/modules/storage-cleanup/storage-cleanup.module';
import { StorageDeleteExecutor } from '@/modules/storage-cleanup/services/storage-delete.executor';
import { CommissionPurgeModule } from '@/modules/commission-purge/commission-purge.module';
import { CommissionPurgeExecutor } from '@/modules/commission-purge/services/commission-purge.executor';
import { TravelDishesModule } from '@/modules/travel-dishes/travel-dishes.module';
import { TravelDishThumbnailExecutor } from '@/modules/travel-dishes/services/travel-dish-thumbnail.executor';
import { TravelRecommendationsModule } from '@/modules/travel-recommendations/travel-recommendations.module';
import { TravelRecommendationImageThumbnailExecutor } from '@/modules/travel-recommendations/services/travel-recommendation-image-thumbnail.executor';
import { TravelEventsModule } from '@/modules/travel-events/travel-events.module';
import { TravelEventThumbnailExecutor } from '@/modules/travel-events/services/travel-event-thumbnail.executor';
import { TravelActivitiesModule } from '@/modules/travel-activities/travel-activities.module';
import {
  TravelActivityImageThumbnailExecutor,
  TravelActivityMediaThumbnailExecutor,
  TravelGroupImageThumbnailExecutor,
} from '@/modules/travel-activities/services/travel-media-thumbnail.executors';
import { TravelSpotsModule } from '@/modules/travel-spots/travel-spots.module';
import { TravelSpotImageThumbnailExecutor } from '@/modules/travel-spots/services/travel-spot-image-thumbnail.executor';
import { PROCESS_EXECUTORS } from '@/modules/process-queue/process-queue.constants';
import { BirthdayConfigModule } from './birthday-config.module';
import { BirthdayCronController } from '@/modules/cron/birthday-cron.controller';
import { BirthdayCronService } from '@/modules/cron/services/birthday-cron.service';
import { BirthdayOutboxService } from '@/modules/cron/services/birthday-outbox.service';
import { ProcessQueueCronController } from '@/modules/cron/process-queue.controller';
import { ProcessQueueRunnerService } from '@/modules/cron/services/process-queue-runner.service';

@Module({
  imports: [
    ConnectionsModule,
    NotificationsModule,
    BirthdayConfigModule,
    UserSettingsModule,
    AssetsModule,
    ProcessQueueModule,
    StorageCleanupModule,
    CommissionPurgeModule,
    TravelDishesModule,
    TravelRecommendationsModule,
    TravelEventsModule,
    TravelActivitiesModule,
    TravelSpotsModule,
  ],
  controllers: [BirthdayCronController, ProcessQueueCronController],
  providers: [
    BirthdayCronService,
    BirthdayOutboxService,
    ProcessQueueRunnerService,
    {
      provide: PROCESS_EXECUTORS,
      useFactory: (
        assetThumbnail: AssetThumbnailExecutor,
        notificationEmail: NotificationEmailExecutor,
        storageDelete: StorageDeleteExecutor,
        commissionPurge: CommissionPurgeExecutor,
        travelDishThumbnail: TravelDishThumbnailExecutor,
        travelRecImageThumbnail: TravelRecommendationImageThumbnailExecutor,
        travelEventThumbnail: TravelEventThumbnailExecutor,
        travelGroupImageThumbnail: TravelGroupImageThumbnailExecutor,
        travelActivityImageThumbnail: TravelActivityImageThumbnailExecutor,
        travelActivityMediaThumbnail: TravelActivityMediaThumbnailExecutor,
        travelSpotImageThumbnail: TravelSpotImageThumbnailExecutor,
      ) => [
        assetThumbnail,
        notificationEmail,
        storageDelete,
        commissionPurge,
        travelDishThumbnail,
        travelRecImageThumbnail,
        travelEventThumbnail,
        travelGroupImageThumbnail,
        travelActivityImageThumbnail,
        travelActivityMediaThumbnail,
        travelSpotImageThumbnail,
      ],
      inject: [
        AssetThumbnailExecutor,
        NotificationEmailExecutor,
        StorageDeleteExecutor,
        CommissionPurgeExecutor,
        TravelDishThumbnailExecutor,
        TravelRecommendationImageThumbnailExecutor,
        TravelEventThumbnailExecutor,
        TravelGroupImageThumbnailExecutor,
        TravelActivityImageThumbnailExecutor,
        TravelActivityMediaThumbnailExecutor,
        TravelSpotImageThumbnailExecutor,
      ],
    },
  ],
})
export class CronModule {}
