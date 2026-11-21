import { Module } from '@nestjs/common';
import { TravelAccessModule } from '@/modules/travel-access/travel-access.module';
import { TravelRecommendationsModule } from '@/modules/travel-recommendations/travel-recommendations.module';
import { TravelCuisinesModule } from '@/modules/travel-cuisines/travel-cuisines.module';
import { TravelDishesController } from '@/modules/travel-dishes/travel-dishes.controller';
import { TravelDishesService } from '@/modules/travel-dishes/services/travel-dishes.service';

@Module({
  imports: [
    TravelAccessModule,
    TravelRecommendationsModule,
    TravelCuisinesModule,
  ],
  controllers: [TravelDishesController],
  providers: [TravelDishesService],
})
export class TravelDishesModule {}
