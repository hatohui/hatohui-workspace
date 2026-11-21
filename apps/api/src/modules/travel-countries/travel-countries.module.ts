import { Module } from '@nestjs/common';
import { TravelAccessModule } from '@/modules/travel-access/travel-access.module';
import { TravelCountriesController } from '@/modules/travel-countries/travel-countries.controller';
import { TravelCountriesService } from '@/modules/travel-countries/services/travel-countries.service';

@Module({
  imports: [TravelAccessModule],
  controllers: [TravelCountriesController],
  providers: [TravelCountriesService],
})
export class TravelCountriesModule {}
