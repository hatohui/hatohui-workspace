import { Module } from '@nestjs/common';
import { SocialPlatformsController } from '@/modules/social-platforms/social-platforms.controller';
import { SocialPlatformsService } from '@/modules/social-platforms/services/social-platforms.service';

@Module({
  controllers: [SocialPlatformsController],
  providers: [SocialPlatformsService],
})
export class SocialPlatformsModule {}
