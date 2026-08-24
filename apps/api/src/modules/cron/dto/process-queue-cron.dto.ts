import { ApiProperty } from '@nestjs/swagger';
import { ProcessType } from '@prisma/client';

export class ProcessQueueRunDto {
  @ApiProperty({ enum: ProcessType, nullable: true, example: null })
  type: ProcessType | 'all';

  @ApiProperty({ description: 'Number of jobs picked up this run' })
  due: number;

  @ApiProperty({ description: 'Number of jobs that succeeded this run' })
  succeeded: number;
}
