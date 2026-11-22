import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { TravelScheduleController } from '@/modules/travel-schedule/travel-schedule.controller';
import { TravelHolidaysService } from '@/modules/travel-schedule/services/travel-holidays.service';
import { TravelScheduleService } from '@/modules/travel-schedule/services/travel-schedule.service';

@Module({
  imports: [AuthModule, UserSettingsModule],
  controllers: [TravelScheduleController],
  providers: [TravelHolidaysService, TravelScheduleService],
  exports: [TravelHolidaysService, TravelScheduleService],
})
export class TravelScheduleModule {}
