import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { TravelRecommendationsController } from '@/modules/travel-recommendations/travel-recommendations.controller';
import { TravelRecommendationsService } from '@/modules/travel-recommendations/services/travel-recommendations.service';
import { TravelRecommendationImagesService } from '@/modules/travel-recommendations/services/travel-recommendation-images.service';

@Module({
  imports: [AuthModule],
  controllers: [TravelRecommendationsController],
  providers: [TravelRecommendationsService, TravelRecommendationImagesService],
  exports: [TravelRecommendationsService],
})
export class TravelRecommendationsModule {}
