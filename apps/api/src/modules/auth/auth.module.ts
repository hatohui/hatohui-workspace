import { Module } from '@nestjs/common';
import { BirthdayConfigModule } from '@/modules/cron/birthday-config.module';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { OptionalAuthGuard } from './optional-auth.guard';
import { SessionService } from './session.service';

@Module({
  imports: [UserSettingsModule, BirthdayConfigModule],
  controllers: [AuthController],
  providers: [AuthService, SessionService, AuthGuard, OptionalAuthGuard],
  exports: [AuthService, SessionService, AuthGuard, OptionalAuthGuard],
})
export class AuthModule {}
