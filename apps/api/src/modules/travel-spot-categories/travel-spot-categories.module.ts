import { Module } from '@nestjs/common';
import { TravelAccessModule } from '@/modules/travel-access/travel-access.module';
import { TravelSpotCategoriesController } from '@/modules/travel-spot-categories/travel-spot-categories.controller';
import { TravelSpotCategoriesService } from '@/modules/travel-spot-categories/services/travel-spot-categories.service';

@Module({
  imports: [TravelAccessModule],
  controllers: [TravelSpotCategoriesController],
  providers: [TravelSpotCategoriesService],
  exports: [TravelSpotCategoriesService],
})
export class TravelSpotCategoriesModule {}
