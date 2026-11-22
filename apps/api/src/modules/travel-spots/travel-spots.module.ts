import { Module } from '@nestjs/common';
import { ProcessQueueModule } from '@/modules/process-queue/process-queue.module';
import { StorageCleanupModule } from '@/modules/storage-cleanup/storage-cleanup.module';
import { TravelAccessModule } from '@/modules/travel-access/travel-access.module';
import { TravelSpotCategoriesModule } from '@/modules/travel-spot-categories/travel-spot-categories.module';
import { TravelSpotImageThumbnailExecutor } from '@/modules/travel-spots/services/travel-spot-image-thumbnail.executor';
import { TravelSpotImagesService } from '@/modules/travel-spots/services/travel-spot-images.service';
import { TravelSpotsService } from '@/modules/travel-spots/services/travel-spots.service';
import { TravelSpotsController } from '@/modules/travel-spots/travel-spots.controller';

@Module({
  imports: [
    ProcessQueueModule,
    StorageCleanupModule,
    TravelAccessModule,
    TravelSpotCategoriesModule,
  ],
  controllers: [TravelSpotsController],
  providers: [
    TravelSpotImageThumbnailExecutor,
    TravelSpotImagesService,
    TravelSpotsService,
  ],
  exports: [TravelSpotImageThumbnailExecutor, TravelSpotsService],
})
export class TravelSpotsModule {}
