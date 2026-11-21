import { Module } from '@nestjs/common';
import { TravelAccessModule } from '@/modules/travel-access/travel-access.module';
import { TravelRecommendationsModule } from '@/modules/travel-recommendations/travel-recommendations.module';
import { TravelPlacesController } from '@/modules/travel-places/travel-places.controller';
import { TravelPlacesService } from '@/modules/travel-places/services/travel-places.service';

@Module({
  imports: [TravelAccessModule, TravelRecommendationsModule],
  controllers: [TravelPlacesController],
  providers: [TravelPlacesService],
})
export class TravelPlacesModule {}
