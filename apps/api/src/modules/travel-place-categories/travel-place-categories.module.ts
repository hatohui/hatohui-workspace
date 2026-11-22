import { Module } from '@nestjs/common';
import { TravelAccessModule } from '@/modules/travel-access/travel-access.module';
import { TravelPlaceCategoriesController } from '@/modules/travel-place-categories/travel-place-categories.controller';
import { TravelPlaceCategoriesService } from '@/modules/travel-place-categories/services/travel-place-categories.service';

@Module({
  imports: [TravelAccessModule],
  controllers: [TravelPlaceCategoriesController],
  providers: [TravelPlaceCategoriesService],
  exports: [TravelPlaceCategoriesService],
})
export class TravelPlaceCategoriesModule {}
