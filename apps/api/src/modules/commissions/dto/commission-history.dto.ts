import { ApiProperty } from '@nestjs/swagger';
import { CommissionStatus } from '@prisma/client';

export class CommissionStatusHistoryDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ example: 'clx1234567890' })
  commissionId: string;

  @ApiProperty({ enum: CommissionStatus, nullable: true })
  fromStatus: CommissionStatus | null;

  @ApiProperty({ enum: CommissionStatus })
  toStatus: CommissionStatus;

  @ApiProperty({ example: 'clx1234567890' })
  changedById: string;

  @ApiProperty({ nullable: true })
  note: string | null;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  createdAt: string;
}
