import { Module } from '@nestjs/common';
import { TravelAccessModule } from '@/modules/travel-access/travel-access.module';
import { TravelAreasController } from '@/modules/travel-areas/travel-areas.controller';
import { TravelAreasService } from '@/modules/travel-areas/services/travel-areas.service';

@Module({
  imports: [TravelAccessModule],
  controllers: [TravelAreasController],
  providers: [TravelAreasService],
})
export class TravelAreasModule {}
