import { Module } from '@nestjs/common';
import { ProcessQueueService } from '@/modules/process-queue/services/process-queue.service';

@Module({
  providers: [ProcessQueueService],
  exports: [ProcessQueueService],
})
export class ProcessQueueModule {}
