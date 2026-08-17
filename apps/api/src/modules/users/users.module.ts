import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { BirthdayConfigModule } from '@/modules/cron/birthday-config.module';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { UsersController } from '@/modules/users/users.controller';
import { UsersService } from '@/modules/users/services/users.service';

@Module({
  imports: [AuthModule, UserSettingsModule, BirthdayConfigModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
