import { ApiProperty } from '@nestjs/swagger';
import { CommissionDto, CommissionPublicDto } from './commission.dto';
import { CommentDto } from './comment.dto';
import { CommissionStatusHistoryDto } from './commission-history.dto';

export class CommissionDetailDto extends CommissionDto {
  @ApiProperty({ type: CommentDto, isArray: true })
  comments: CommentDto[];

  @ApiProperty({ type: CommissionStatusHistoryDto, isArray: true })
  history: CommissionStatusHistoryDto[];
}

export class CommissionPublicDetailDto extends CommissionPublicDto {
  @ApiProperty({ type: CommentDto, isArray: true })
  comments: CommentDto[];
}
