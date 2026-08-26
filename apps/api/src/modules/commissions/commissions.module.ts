import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { CommissionsController } from '@/modules/commissions/commissions.controller';
import { CommissionsService } from '@/modules/commissions/services/commissions.service';

@Module({
  imports: [AuthModule, UserSettingsModule],
  controllers: [CommissionsController],
  providers: [CommissionsService],
})
export class CommissionsModule {}
