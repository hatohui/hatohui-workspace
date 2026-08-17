import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { NotificationsController } from '@/modules/notifications/notifications.controller';
import { NotificationsService } from '@/modules/notifications/services/notifications.service';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
