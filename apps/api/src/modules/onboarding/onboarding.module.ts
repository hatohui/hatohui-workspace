import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { FriendsModule } from '@/modules/friends/friends.module';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';

@Module({
  imports: [AuthModule, FriendsModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
