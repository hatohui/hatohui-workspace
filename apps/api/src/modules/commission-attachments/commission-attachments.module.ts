import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { ImagesModule } from '@/modules/images/images.module';
import { ProcessQueueModule } from '@/modules/process-queue/process-queue.module';
import { StorageCleanupModule } from '@/modules/storage-cleanup/storage-cleanup.module';
import { CommissionAttachmentsController } from '@/modules/commission-attachments/commission-attachments.controller';
import { CommissionAttachmentsService } from '@/modules/commission-attachments/services/commission-attachments.service';

@Module({
  imports: [AuthModule, ImagesModule, ProcessQueueModule, StorageCleanupModule],
  controllers: [CommissionAttachmentsController],
  providers: [CommissionAttachmentsService],
  exports: [CommissionAttachmentsService],
})
export class CommissionAttachmentsModule {}
