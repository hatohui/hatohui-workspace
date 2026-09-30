import { Module } from '@nestjs/common';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { ProcessQueueModule } from '@/modules/process-queue/process-queue.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { CommissionAttachmentsModule } from '@/modules/commission-attachments/commission-attachments.module';
import { CommissionPurgeService } from '@/modules/commission-purge/services/commission-purge.service';
import { CommissionPurgeExecutor } from '@/modules/commission-purge/services/commission-purge.executor';

@Module({
  imports: [
    UserSettingsModule,
    ProcessQueueModule,
    AssetsModule,
    CommissionAttachmentsModule,
  ],
  providers: [CommissionPurgeService, CommissionPurgeExecutor],
  exports: [CommissionPurgeService, CommissionPurgeExecutor],
})
export class CommissionPurgeModule {}
