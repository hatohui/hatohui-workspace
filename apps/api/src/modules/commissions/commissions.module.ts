import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { CommissionOpeningsModule } from '@/modules/commission-openings/commission-openings.module';
import { CommissionsController } from '@/modules/commissions/commissions.controller';
import { CommissionsService } from '@/modules/commissions/services/commissions.service';

@Module({
  imports: [AuthModule, UserSettingsModule, CommissionOpeningsModule],
  controllers: [CommissionsController],
  providers: [CommissionsService],
})
export class CommissionsModule {}
