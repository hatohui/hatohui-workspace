import { Module } from '@nestjs/common';
import { ProcessQueueModule } from '@/modules/process-queue/process-queue.module';
import { StorageCleanupModule } from '@/modules/storage-cleanup/storage-cleanup.module';
import { TravelAccessModule } from '@/modules/travel-access/travel-access.module';
import { TravelRecommendationsModule } from '@/modules/travel-recommendations/travel-recommendations.module';
import { TravelCuisinesModule } from '@/modules/travel-cuisines/travel-cuisines.module';
import { TravelFoodCategoriesModule } from '@/modules/travel-food-categories/travel-food-categories.module';
import { TravelDishesController } from '@/modules/travel-dishes/travel-dishes.controller';
import { TravelDishesService } from '@/modules/travel-dishes/services/travel-dishes.service';
import { TravelDishThumbnailExecutor } from '@/modules/travel-dishes/services/travel-dish-thumbnail.executor';

@Module({
  imports: [
    TravelAccessModule,
    TravelRecommendationsModule,
    TravelCuisinesModule,
    TravelFoodCategoriesModule,
    ProcessQueueModule,
    StorageCleanupModule,
  ],
  controllers: [TravelDishesController],
  providers: [TravelDishesService, TravelDishThumbnailExecutor],
  exports: [TravelDishThumbnailExecutor],
})
export class TravelDishesModule {}
