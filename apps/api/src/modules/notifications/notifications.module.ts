import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { ProcessQueueModule } from '@/modules/process-queue/process-queue.module';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { NotificationsController } from '@/modules/notifications/notifications.controller';
import { NotificationsService } from '@/modules/notifications/services/notifications.service';
import { NotificationEmailService } from '@/modules/notifications/services/notification-email.service';
import { NotificationEmailExecutor } from '@/modules/notifications/services/notification-email.executor';

@Module({
  imports: [AuthModule, ProcessQueueModule, UserSettingsModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationEmailService,
    NotificationEmailExecutor,
  ],
  exports: [
    NotificationsService,
    NotificationEmailService,
    NotificationEmailExecutor,
  ],
})
export class NotificationsModule {}
