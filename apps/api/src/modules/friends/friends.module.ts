import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AvatarsModule } from '@/modules/avatars/avatars.module';
import { ConnectionsModule } from '@/modules/connections/connections.module';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  imports: [AuthModule, AvatarsModule, ConnectionsModule],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
