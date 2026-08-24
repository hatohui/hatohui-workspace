import { Inject, Injectable, Logger } from '@nestjs/common';
import { ProcessQueueService } from '@/modules/process-queue/services/process-queue.service';
import {
  PROCESS_EXECUTORS,
  type ProcessExecutor,
  type ProcessType,
} from '@/modules/process-queue/process-queue.constants';

export interface ProcessQueueRunResult {
  type: ProcessType | 'all';
  due: number;
  succeeded: number;
}

@Injectable()
export class ProcessQueueRunnerService {
  private readonly logger = new Logger(ProcessQueueRunnerService.name);

  constructor(
    private readonly queue: ProcessQueueService,
    @Inject(PROCESS_EXECUTORS) private readonly executors: ProcessExecutor[],
  ) {}

  async run(
    type?: ProcessType,
    limit?: number,
  ): Promise<ProcessQueueRunResult> {
    const due = await this.queue.findDue(type, limit);
    let succeeded = 0;

    for (const job of due) {
      const executor = this.executors.find((e) => e.type === job.type);
      if (!executor) {
        this.logger.warn(`No executor registered for process type ${job.type}`);
        continue;
      }

      try {
        await executor.execute(job.refId);
        await this.queue.markSucceeded(job.id);
        succeeded++;
      } catch (err) {
        this.logger.warn(`Retry failed for ${job.type}/${job.refId}: ${err}`);
        await this.queue.enqueueFailure(job.type, job.refId, err);
      }
    }

    return { type: type ?? 'all', due: due.length, succeeded };
  }
}
