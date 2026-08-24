import { Module } from '@nestjs/common';
import { ConnectionsModule } from '@/modules/connections/connections.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { ProcessQueueModule } from '@/modules/process-queue/process-queue.module';
import { AssetThumbnailExecutor } from '@/modules/assets/services/asset-thumbnail-executor.service';
import { PROCESS_EXECUTORS } from '@/modules/process-queue/process-queue.constants';
import { BirthdayConfigModule } from './birthday-config.module';
import { BirthdayCronController } from '@/modules/cron/birthday-cron.controller';
import { BirthdayCronService } from '@/modules/cron/services/birthday-cron.service';
import { BirthdayOutboxService } from '@/modules/cron/services/birthday-outbox.service';
import { ProcessQueueCronController } from '@/modules/cron/process-queue.controller';
import { ProcessQueueRunnerService } from '@/modules/cron/services/process-queue-runner.service';

@Module({
  imports: [
    ConnectionsModule,
    NotificationsModule,
    BirthdayConfigModule,
    UserSettingsModule,
    AssetsModule,
    ProcessQueueModule,
  ],
  controllers: [BirthdayCronController, ProcessQueueCronController],
  providers: [
    BirthdayCronService,
    BirthdayOutboxService,
    ProcessQueueRunnerService,
    {
      provide: PROCESS_EXECUTORS,
      useFactory: (assetThumbnail: AssetThumbnailExecutor) => [assetThumbnail],
      inject: [AssetThumbnailExecutor],
    },
  ],
})
export class CronModule {}
