import { ApiProperty } from '@nestjs/swagger';
import { CommissionDto, CommissionPublicDto } from './commission.dto';
import { CommentDto } from './comment.dto';
import { CommissionStatusHistoryDto } from './commission-history.dto';
import { CommissionQueuePlacementDto } from './commission-queue.dto';

export class CommissionDetailDto extends CommissionDto {
  @ApiProperty({ type: CommentDto, isArray: true })
  comments: CommentDto[];

  @ApiProperty({ type: CommissionStatusHistoryDto, isArray: true })
  history: CommissionStatusHistoryDto[];
}

export class CommissionPublicDetailDto extends CommissionPublicDto {
  @ApiProperty({ example: 'Jane Doe' })
  clientName: string;

  @ApiProperty({
    type: CommissionQueuePlacementDto,
    nullable: true,
    description: 'Where this sits in the public queue; null when not queued',
  })
  queue: CommissionQueuePlacementDto | null;

  @ApiProperty({ type: CommentDto, isArray: true })
  comments: CommentDto[];
}
