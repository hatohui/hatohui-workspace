import { Module } from '@nestjs/common';
import { BirthdayConfigModule } from '@/modules/cron/birthday-config.module';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { AuthController } from '@/modules/auth/auth.controller';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { AuthService } from '@/modules/auth/services/auth.service';
import { OptionalAuthGuard } from '@/modules/auth/guards/optional-auth.guard';
import { SessionService } from '@/modules/auth/services/session.service';
import { IdentityClaimService } from '@/modules/auth/services/identity-claim.service';

@Module({
  imports: [UserSettingsModule, BirthdayConfigModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionService,
    IdentityClaimService,
    AuthGuard,
    OptionalAuthGuard,
  ],
  exports: [AuthService, SessionService, AuthGuard, OptionalAuthGuard],
})
export class AuthModule {}
