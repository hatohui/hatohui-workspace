import { Module } from '@nestjs/common';
import { ConnectionsModule } from '@/modules/connections/connections.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { BirthdayConfigModule } from './birthday-config.module';
import { BirthdayCronController } from '@/modules/cron/birthday-cron.controller';
import { BirthdayCronService } from '@/modules/cron/services/birthday-cron.service';
import { BirthdayOutboxService } from '@/modules/cron/services/birthday-outbox.service';

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
