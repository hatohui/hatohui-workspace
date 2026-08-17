import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { ConnectionsModule } from '@/modules/connections/connections.module';
import { ProfilesModule } from '@/modules/profiles/profiles.module';
import { OnboardingController } from '@/modules/onboarding/onboarding.controller';
import { OnboardingService } from '@/modules/onboarding/services/onboarding.service';

@Module({
  imports: [AuthModule, ConnectionsModule, ProfilesModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
