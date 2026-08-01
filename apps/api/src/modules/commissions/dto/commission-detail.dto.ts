import { ApiProperty } from '@nestjs/swagger';
import { CommissionDto, CommissionPublicDto } from './commission.dto';
import { CommissionNoteDto } from './commission-note.dto';
import { CommissionStatusHistoryDto } from './commission-history.dto';

export class CommissionDetailDto extends CommissionDto {
  @ApiProperty({ type: CommissionNoteDto, isArray: true })
  notes: CommissionNoteDto[];

  @ApiProperty({ type: CommissionStatusHistoryDto, isArray: true })
  history: CommissionStatusHistoryDto[];
}

/// Client-facing detail view (via access code): the public field set plus
/// only CLIENT-visibility notes. Never includes the internal step checklist
/// or status history, which may carry internal-only remarks.
export class CommissionPublicDetailDto extends CommissionPublicDto {
  @ApiProperty({ type: CommissionNoteDto, isArray: true })
  notes: CommissionNoteDto[];
}
