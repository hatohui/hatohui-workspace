import { ApiProperty } from '@nestjs/swagger';
import { CommissionStatus, CommissionType } from '@prisma/client';

export class CommissionQueueItemDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ example: 'Full-body character commission' })
  title: string;

  @ApiProperty({ enum: CommissionStatus })
  status: CommissionStatus;

  @ApiProperty({ enum: CommissionType, nullable: true })
  commissionType: CommissionType | null;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  createdAt: string;
}

export class CommissionQueueDto {
  @ApiProperty({ type: CommissionQueueItemDto, isArray: true })
  items: CommissionQueueItemDto[];
}
