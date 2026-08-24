import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ProcessType } from '@prisma/client';
import { ADMIN_KEY_HEADER } from '@/common/utils/admin-key';
import { CronGuard } from '@/modules/cron/guards/cron.guard';
import { ProcessQueueRunnerService } from '@/modules/cron/services/process-queue-runner.service';
import { ProcessQueueRunDto } from '@/modules/cron/dto/process-queue-cron.dto';

@ApiTags('cron')
@Controller('cron/queue')
@UseGuards(CronGuard)
@ApiHeader({
  name: ADMIN_KEY_HEADER,
  required: true,
  description: 'Admin API key — required on every route in this controller',
})
export class ProcessQueueCronController {
  constructor(private readonly runner: ProcessQueueRunnerService) {}

  @Post('process')
  @ApiOperation({
    operationId: 'processQueue',
    summary:
      'Retry due process-queue jobs, optionally scoped to one type. Idempotent.',
  })
  @ApiQuery({ name: 'type', enum: ProcessType, required: false })
  @ApiOkResponse({ type: ProcessQueueRunDto })
  process(@Query('type') type?: ProcessType): Promise<ProcessQueueRunDto> {
    return this.runner.run(type);
  }
}
