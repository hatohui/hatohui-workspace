import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { TravelAllergiesController } from '@/modules/travel-allergies/travel-allergies.controller';
import { TravelAllergiesService } from '@/modules/travel-allergies/services/travel-allergies.service';

@Module({
  imports: [AuthModule],
  controllers: [TravelAllergiesController],
  providers: [TravelAllergiesService],
})
export class TravelAllergiesModule {}
