import { Module } from '@nestjs/common';
import { TravelAccessModule } from '@/modules/travel-access/travel-access.module';
import { TravelFoodCategoriesController } from '@/modules/travel-food-categories/travel-food-categories.controller';
import { TravelFoodCategoriesService } from '@/modules/travel-food-categories/services/travel-food-categories.service';

@Module({
  imports: [TravelAccessModule],
  controllers: [TravelFoodCategoriesController],
  providers: [TravelFoodCategoriesService],
  exports: [TravelFoodCategoriesService],
})
export class TravelFoodCategoriesModule {}
