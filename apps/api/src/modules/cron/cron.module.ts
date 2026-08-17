import { Module } from '@nestjs/common';
import { ConnectionsModule } from '@/modules/connections/connections.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { BirthdayConfigModule } from './birthday-config.module';
import { BirthdayCronController } from './birthday-cron.controller';
import { BirthdayCronService } from './birthday-cron.service';
import { BirthdayOutboxService } from './birthday-outbox.service';

@Module({
  imports: [
    ConnectionsModule,
    NotificationsModule,
    BirthdayConfigModule,
    UserSettingsModule,
  ],
  controllers: [BirthdayCronController],
  providers: [BirthdayCronService, BirthdayOutboxService],
})
export class CronModule {}
