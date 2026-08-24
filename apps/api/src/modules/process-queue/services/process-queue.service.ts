import { Injectable } from '@nestjs/common';
import { Database } from '@/infra/db';
import type { ProcessQueue } from '@prisma/client';
import {
  PROCESS_QUEUE_BATCH_SIZE,
  PROCESS_QUEUE_RETRY_BASE_MINUTES,
  PROCESS_QUEUE_RETRY_CAP_MINUTES,
  ProcessType,
} from '@/modules/process-queue/process-queue.constants';

@Injectable()
export class ProcessQueueService {
  constructor(private readonly db: Database) {}

  async findDue(
    type: ProcessType | undefined,
    limit = PROCESS_QUEUE_BATCH_SIZE,
  ): Promise<ProcessQueue[]> {
    return this.db.processQueue.findMany({
      where: {
        nextAttemptAt: { lte: new Date() },
        ...(type ? { type } : {}),
      },
      take: limit,
      orderBy: { nextAttemptAt: 'asc' },
    });
  }

  async markSucceeded(id: string): Promise<void> {
    await this.db.processQueue.delete({ where: { id } }).catch(() => {});
  }

  async enqueueFailure(
    type: ProcessType,
    refId: string,
    error: unknown,
  ): Promise<void> {
    const message = error instanceof Error ? error.message : String(error);
    const existing = await this.db.processQueue.findUnique({
      where: { type_refId: { type, refId } },
    });
    const attempts = (existing?.attempts ?? 0) + 1;

    await this.db.processQueue.upsert({
      where: { type_refId: { type, refId } },
      create: {
        type,
        refId,
        attempts,
        lastError: message,
        nextAttemptAt: nextBackoff(attempts),
      },
      update: {
        attempts,
        lastError: message,
        nextAttemptAt: nextBackoff(attempts),
      },
    });
  }

  async clearForRef(type: ProcessType, refId: string): Promise<void> {
    await this.db.processQueue.deleteMany({ where: { type, refId } });
  }
}

function nextBackoff(attempts: number): Date {
  const minutes = Math.min(
    PROCESS_QUEUE_RETRY_BASE_MINUTES * 2 ** (attempts - 1),
    PROCESS_QUEUE_RETRY_CAP_MINUTES,
  );
  return new Date(Date.now() + minutes * 60_000);
}
