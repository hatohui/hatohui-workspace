import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { TravelAccessModule } from '@/modules/travel-access/travel-access.module';
import { TravelScheduleModule } from '@/modules/travel-schedule/travel-schedule.module';
import { TravelAdminJobProfilesController } from '@/modules/travel-job-profiles/controllers/travel-admin-job-profiles.controller';
import { TravelJobProfilesController } from '@/modules/travel-job-profiles/controllers/travel-job-profiles.controller';
import { TravelJobProfilesService } from '@/modules/travel-job-profiles/services/travel-job-profiles.service';

@Module({
  imports: [AuthModule, TravelAccessModule, TravelScheduleModule],
  controllers: [TravelJobProfilesController, TravelAdminJobProfilesController],
  providers: [TravelJobProfilesService],
  exports: [TravelJobProfilesService],
})
export class TravelJobProfilesModule {}
