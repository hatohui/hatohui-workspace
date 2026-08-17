import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AvatarsModule } from '@/modules/avatars/avatars.module';
import { ConnectionsModule } from '@/modules/connections/connections.module';
import { ViewerContextModule } from '@/modules/viewer-context/viewer-context.module';
import { FriendsController } from '@/modules/profiles/friends.controller';
import { ProfilesService } from '@/modules/profiles/services/profiles.service';

@Module({
  imports: [AuthModule, AvatarsModule, ConnectionsModule, ViewerContextModule],
  controllers: [FriendsController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
