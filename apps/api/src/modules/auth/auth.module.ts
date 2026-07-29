import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { OptionalAuthGuard } from './optional-auth.guard';
import { SessionService } from './session.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionService, AuthGuard, OptionalAuthGuard],
  exports: [SessionService, AuthGuard, OptionalAuthGuard],
})
export class AuthModule {}
