import { ApiProperty } from '@nestjs/swagger';
import {
  QUEUE_STAGES,
  type QueueStage,
} from '@/modules/commissions/commissions.constants';

export class CommissionQueuePlacementDto {
  @ApiProperty({ example: 3, description: '1-based place in the work order' })
  position: number;

  @ApiProperty({ example: 7 })
  total: number;

  @ApiProperty({ enum: QUEUE_STAGES, enumName: 'QueueStage' })
  stage: QueueStage;

  @ApiProperty({ example: 1, description: '0-based index into QUEUE_STAGES' })
  stageIndex: number;

  @ApiProperty({ example: 4 })
  stageCount: number;
}

export class CommissionQueueItemDto extends CommissionQueuePlacementDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Also the i18n key: commission.type.<key>',
  })
  commissionTypeKey: string | null;

  @ApiProperty({ nullable: true, type: String })
  commissionTypeLabel: string | null;

  @ApiProperty({ description: 'Whether a passcode can open this item' })
  isUnlockable: boolean;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  queuedAt: string;
}

export class CommissionQueueDto {
  @ApiProperty({ type: CommissionQueueItemDto, isArray: true })
  items: CommissionQueueItemDto[];
}
