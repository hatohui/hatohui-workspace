import { Module } from '@nestjs/common';
import { TravelAccessModule } from '@/modules/travel-access/travel-access.module';
import { TravelCuisinesController } from '@/modules/travel-cuisines/travel-cuisines.controller';
import { TravelCuisinesService } from '@/modules/travel-cuisines/services/travel-cuisines.service';

@Module({
  imports: [TravelAccessModule],
  controllers: [TravelCuisinesController],
  providers: [TravelCuisinesService],
  exports: [TravelCuisinesService],
})
export class TravelCuisinesModule {}
