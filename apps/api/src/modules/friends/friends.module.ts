import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AvatarsModule } from '@/modules/avatars/avatars.module';
import { ConnectionsModule } from '@/modules/connections/connections.module';
import { FriendsController } from './friends.controller';
import { ProfilesService } from './profiles.service';
import { BirthdaysService } from './birthdays.service';
import { SocialGraphService } from './social-graph.service';
import { ViewerContextService } from './viewer-context';

@Module({
  imports: [AuthModule, AvatarsModule, ConnectionsModule],
  controllers: [FriendsController],
  providers: [
    ProfilesService,
    BirthdaysService,
    SocialGraphService,
    ViewerContextService,
  ],
  exports: [ProfilesService],
})
export class FriendsModule {}
