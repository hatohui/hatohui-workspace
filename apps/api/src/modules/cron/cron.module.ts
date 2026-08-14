import { Module } from '@nestjs/common';
import { ConnectionsModule } from '@/modules/connections/connections.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { BirthdayConfigService } from './birthday-config';
import { BirthdayCronController } from './birthday-cron.controller';
import { BirthdayCronService } from './birthday-cron.service';
import { BirthdayOutboxService } from './birthday-outbox.service';

@Module({
  imports: [ConnectionsModule, NotificationsModule],
  controllers: [BirthdayCronController],
  providers: [
    BirthdayCronService,
    BirthdayConfigService,
    BirthdayOutboxService,
  ],
})
export class CronModule {}
