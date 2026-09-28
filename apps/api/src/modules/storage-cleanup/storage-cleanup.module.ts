import { Module } from '@nestjs/common';
import { ProcessQueueModule } from '@/modules/process-queue/process-queue.module';
import { StorageCleanupService } from '@/modules/storage-cleanup/services/storage-cleanup.service';
import { StorageDeleteExecutor } from '@/modules/storage-cleanup/services/storage-delete.executor';

@Module({
  imports: [ProcessQueueModule],
  providers: [StorageCleanupService, StorageDeleteExecutor],
  exports: [StorageCleanupService, StorageDeleteExecutor],
})
export class StorageCleanupModule {}
