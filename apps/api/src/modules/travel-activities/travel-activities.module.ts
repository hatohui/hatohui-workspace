import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { ProcessQueueModule } from '@/modules/process-queue/process-queue.module';
import { StorageCleanupModule } from '@/modules/storage-cleanup/storage-cleanup.module';
import { TravelActivitiesController } from '@/modules/travel-activities/travel-activities.controller';
import { TravelActivitiesService } from '@/modules/travel-activities/services/travel-activities.service';
import {
  TravelActivityImageThumbnailExecutor,
  TravelActivityMediaThumbnailExecutor,
  TravelGroupImageThumbnailExecutor,
} from '@/modules/travel-activities/services/travel-media-thumbnail.executors';

@Module({
  imports: [AuthModule, ProcessQueueModule, StorageCleanupModule],
  controllers: [TravelActivitiesController],
  providers: [
    TravelActivitiesService,
    TravelGroupImageThumbnailExecutor,
    TravelActivityImageThumbnailExecutor,
    TravelActivityMediaThumbnailExecutor,
  ],
  exports: [
    TravelActivitiesService,
    TravelGroupImageThumbnailExecutor,
    TravelActivityImageThumbnailExecutor,
    TravelActivityMediaThumbnailExecutor,
  ],
})
export class TravelActivitiesModule {}
