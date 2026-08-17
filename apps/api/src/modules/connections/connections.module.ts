import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { ConnectionsController } from '@/modules/connections/connections.controller';
import { ConnectionsService } from '@/modules/connections/services/connections.service';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [ConnectionsController],
  providers: [ConnectionsService],
  exports: [ConnectionsService],
})
export class ConnectionsModule {}
