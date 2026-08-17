import { Module } from '@nestjs/common';
import { UserSettingsService } from '@/modules/user-settings/services/user-settings.service';

@Module({
  providers: [UserSettingsService],
  exports: [UserSettingsService],
})
export class UserSettingsModule {}
