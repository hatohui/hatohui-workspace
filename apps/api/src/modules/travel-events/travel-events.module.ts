import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { ProcessQueueModule } from '@/modules/process-queue/process-queue.module';
import { StorageCleanupModule } from '@/modules/storage-cleanup/storage-cleanup.module';
import { TravelAccessModule } from '@/modules/travel-access/travel-access.module';
import { TravelAdminEventsController } from '@/modules/travel-events/controllers/travel-admin-events.controller';
import { TravelEventsController } from '@/modules/travel-events/controllers/travel-events.controller';
import { TravelEventThumbnailExecutor } from '@/modules/travel-events/services/travel-event-thumbnail.executor';
import { TravelEventsService } from '@/modules/travel-events/services/travel-events.service';

@Module({
  imports: [
    AuthModule,
    TravelAccessModule,
    ProcessQueueModule,
    StorageCleanupModule,
  ],
  controllers: [TravelEventsController, TravelAdminEventsController],
  providers: [TravelEventsService, TravelEventThumbnailExecutor],
  exports: [TravelEventsService, TravelEventThumbnailExecutor],
})
export class TravelEventsModule {}
