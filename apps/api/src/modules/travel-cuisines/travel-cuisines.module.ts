import { Module } from '@nestjs/common';
import { TravelCuisinesController } from '@/modules/travel-cuisines/travel-cuisines.controller';
import { TravelCuisinesService } from '@/modules/travel-cuisines/services/travel-cuisines.service';

@Module({
  controllers: [TravelCuisinesController],
  providers: [TravelCuisinesService],
  exports: [TravelCuisinesService],
})
export class TravelCuisinesModule {}
