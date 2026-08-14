import { ApiProperty } from '@nestjs/swagger';

export class BirthdayEvaluationDto {
  @ApiProperty({ description: 'Birthdays examined across every timezone' })
  examined: number;

  @ApiProperty({ description: 'Birthdays landing on a reminder day right now' })
  due: number;

  @ApiProperty({ description: 'Rows added to the outbox by this pass' })
  queued: number;

  @ApiProperty({
    description:
      'Rows this pass derived that were already queued by an earlier pass',
  })
  alreadyQueued: number;

  @ApiProperty({
    description: 'In-app birthday notifications created by this pass',
  })
  notified: number;
}

export class BirthdayProcessingDto {
  @ApiProperty({ description: 'Rows claimed for sending by this pass' })
  claimed: number;

  @ApiProperty()
  sent: number;

  @ApiProperty({ description: 'Rows the provider rejected outright' })
  failed: number;

  @ApiProperty({
    description:
      'Claimed rows released back to the queue, either because the daily quota ran out mid-batch or because their template is unconfigured',
  })
  released: number;

  @ApiProperty({
    description: 'Whether the provider reported a rate limit during this pass',
  })
  rateLimited: boolean;

  @ApiProperty({ description: 'Sends still allowed today after this pass' })
  remainingBudget: number;
}

export class BirthdayCleanupDto {
  @ApiProperty({ description: 'Sent rows past the retention window, deleted' })
  deleted: number;
}
