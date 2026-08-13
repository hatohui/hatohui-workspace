import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AvatarsModule } from '@/modules/avatars/avatars.module';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  imports: [AuthModule, AvatarsModule],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
