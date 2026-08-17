import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { ConnectionsModule } from '@/modules/connections/connections.module';
import { ViewerContextModule } from '@/modules/viewer-context/viewer-context.module';
import { SocialGraphController } from '@/modules/social-graph/social-graph.controller';
import { SocialGraphService } from '@/modules/social-graph/services/social-graph.service';

@Module({
  imports: [AuthModule, ConnectionsModule, ViewerContextModule],
  controllers: [SocialGraphController],
  providers: [SocialGraphService],
})
export class SocialGraphModule {}
