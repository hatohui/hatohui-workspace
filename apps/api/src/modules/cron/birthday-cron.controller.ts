import { Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ADMIN_KEY_HEADER } from '@/common/utils/admin-key';
import { BirthdayCronService } from '@/modules/cron/services/birthday-cron.service';
import { CronGuard } from '@/modules/cron/guards/cron.guard';
import {
  BirthdayCleanupDto,
  BirthdayEvaluationDto,
  BirthdayProcessingDto,
} from '@/modules/cron/dto/birthday-cron.dto';

@ApiTags('cron')
@Controller('cron/friends/birthdays')
@UseGuards(CronGuard)
@ApiHeader({
  name: ADMIN_KEY_HEADER,
  required: true,
  description: 'Admin API key — required on every route in this controller',
})
export class BirthdayCronController {
  constructor(private readonly cron: BirthdayCronService) {}

  @Post('evaluate')
  @ApiOperation({
    operationId: 'evaluateBirthdayReminders',
    summary:
      "Queue reminders that are due now in each birthday owner's timezone. Runs hourly; re-running is a no-op.",
  })
  @ApiOkResponse({ type: BirthdayEvaluationDto })
  evaluate(): Promise<BirthdayEvaluationDto> {
    return this.cron.evaluate();
  }

  @Post('process')
  @ApiOperation({
    operationId: 'processBirthdayReminders',
    summary:
      'Send queued reminders within the remaining daily quota. Unsent rows stay queued for the next run.',
  })
  @ApiOkResponse({ type: BirthdayProcessingDto })
  process(): Promise<BirthdayProcessingDto> {
    return this.cron.process();
  }

  @Post('cleanup')
  @ApiOperation({
    operationId: 'cleanupBirthdayReminders',
    summary: 'Drop sent reminders past the retention window',
  })
  @ApiOkResponse({ type: BirthdayCleanupDto })
  cleanup(): Promise<BirthdayCleanupDto> {
    return this.cron.cleanup();
  }
}
