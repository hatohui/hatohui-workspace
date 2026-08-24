export { ProcessType } from '@prisma/client';
import type { ProcessType } from '@prisma/client';

export interface ProcessExecutor {
  readonly type: ProcessType;
  execute(refId: string): Promise<void>;
}

export const PROCESS_EXECUTORS = Symbol('PROCESS_EXECUTORS');

export const PROCESS_QUEUE_RETRY_BASE_MINUTES = 5;
export const PROCESS_QUEUE_RETRY_CAP_MINUTES = 6 * 60;
export const PROCESS_QUEUE_BATCH_SIZE = 20;
