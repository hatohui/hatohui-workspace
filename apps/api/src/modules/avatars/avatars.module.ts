import { Module } from '@nestjs/common';
import { AvatarsService } from '@/modules/avatars/services/avatars.service';

@Module({
  providers: [AvatarsService],
  exports: [AvatarsService],
})
export class AvatarsModule {}
