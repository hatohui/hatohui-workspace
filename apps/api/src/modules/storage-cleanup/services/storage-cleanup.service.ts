import { Injectable, Logger } from '@nestjs/common';
import { Storage } from '@/infra/storage';
import { ProcessQueueService } from '@/modules/process-queue/services/process-queue.service';
import { ProcessType } from '@/modules/process-queue/process-queue.constants';

@Injectable()
export class StorageCleanupService {
  private readonly logger = new Logger(StorageCleanupService.name);

  constructor(
    private readonly storage: Storage,
    private readonly processQueue: ProcessQueueService,
  ) {}

  async delete(key: string): Promise<void> {
    try {
      await this.storage.deleteObject(key);
    } catch (err) {
      this.logger.warn(`Storage delete failed for ${key}, queued: ${err}`);
      await this.processQueue
        .enqueueFailure(ProcessType.STORAGE_DELETE, key, err)
        .catch((queueErr) =>
          this.logger.error(`Could not queue delete for ${key}: ${queueErr}`),
        );
    }
  }
}
