import { ApiProperty } from '@nestjs/swagger';
import { CommissionStatus } from '@prisma/client';

export class CommissionQueueItemDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ enum: CommissionStatus })
  status: CommissionStatus;

  @ApiProperty({
    nullable: true,
    description: 'Also the i18n key: commission.type.<key>',
  })
  commissionTypeKey: string | null;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  createdAt: string;
}

export class CommissionQueueDto {
  @ApiProperty({ type: CommissionQueueItemDto, isArray: true })
  items: CommissionQueueItemDto[];
}
