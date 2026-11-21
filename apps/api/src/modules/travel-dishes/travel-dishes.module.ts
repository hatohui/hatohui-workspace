import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { TravelRecommendationsModule } from '@/modules/travel-recommendations/travel-recommendations.module';
import { TravelDishesController } from '@/modules/travel-dishes/travel-dishes.controller';
import { TravelDishesService } from '@/modules/travel-dishes/services/travel-dishes.service';

@Module({
  imports: [AuthModule, TravelRecommendationsModule],
  controllers: [TravelDishesController],
  providers: [TravelDishesService],
})
export class TravelDishesModule {}
