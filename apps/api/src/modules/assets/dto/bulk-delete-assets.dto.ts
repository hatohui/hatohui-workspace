import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsString,
} from 'class-validator';
import { ASSET_BULK_DELETE_MAX } from '@/modules/assets/assets.constants';

export class BulkDeleteAssetsDto {
  @ApiProperty({
    example: ['clx1234567890', 'clx0987654321'],
    type: [String],
    maxItems: ASSET_BULK_DELETE_MAX,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(ASSET_BULK_DELETE_MAX)
  @ArrayUnique()
  @IsString({ each: true })
  ids: string[];
}

export class BulkDeleteAssetsResultDto {
  @ApiProperty({
    example: ['clx1234567890'],
    type: [String],
    description: 'Ids that were deleted; ids that no longer exist are skipped',
  })
  deletedIds: string[];
}
