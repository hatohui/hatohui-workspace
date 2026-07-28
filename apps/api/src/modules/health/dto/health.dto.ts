import { ApiProperty } from '@nestjs/swagger';

export type DependencyStatus = 'ok' | 'error';

export class HealthDto {
  @ApiProperty({ enum: ['ok', 'error'] })
  status: DependencyStatus;

  @ApiProperty({ enum: ['ok', 'error'] })
  db: DependencyStatus;

  @ApiProperty({ enum: ['ok', 'error'] })
  redis: DependencyStatus;
}
