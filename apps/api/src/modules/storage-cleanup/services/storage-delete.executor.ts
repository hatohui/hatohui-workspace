import { Injectable } from '@nestjs/common';
import { ProcessType } from '@prisma/client';
import { Storage } from '@/infra/storage';
import type { ProcessExecutor } from '@/modules/process-queue/process-queue.constants';

@Injectable()
export class StorageDeleteExecutor implements ProcessExecutor {
  readonly type = ProcessType.STORAGE_DELETE;

  constructor(private readonly storage: Storage) {}

  async execute(key: string): Promise<void> {
    await this.storage.deleteObject(key);
  }
}
