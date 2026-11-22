import { Module } from '@nestjs/common';
import { ProcessQueueModule } from '@/modules/process-queue/process-queue.module';
import { StorageCleanupModule } from '@/modules/storage-cleanup/storage-cleanup.module';
import { TravelAccessModule } from '@/modules/travel-access/travel-access.module';
import { TravelCuisinesModule } from '@/modules/travel-cuisines/travel-cuisines.module';
import { TravelFoodCategoriesModule } from '@/modules/travel-food-categories/travel-food-categories.module';
import { TravelPlaceCategoriesModule } from '@/modules/travel-place-categories/travel-place-categories.module';
import { TravelRecommendationsController } from '@/modules/travel-recommendations/travel-recommendations.controller';
import { TravelRecommendationsService } from '@/modules/travel-recommendations/services/travel-recommendations.service';
import { TravelRecommendationImagesService } from '@/modules/travel-recommendations/services/travel-recommendation-images.service';
import { TravelRecommendationImageThumbnailExecutor } from '@/modules/travel-recommendations/services/travel-recommendation-image-thumbnail.executor';

@Module({
  imports: [
    TravelAccessModule,
    TravelCuisinesModule,
    TravelFoodCategoriesModule,
    TravelPlaceCategoriesModule,
    ProcessQueueModule,
    StorageCleanupModule,
  ],
  controllers: [TravelRecommendationsController],
  providers: [
    TravelRecommendationsService,
    TravelRecommendationImagesService,
    TravelRecommendationImageThumbnailExecutor,
  ],
  exports: [
    TravelRecommendationsService,
    TravelRecommendationImageThumbnailExecutor,
  ],
})
export class TravelRecommendationsModule {}
