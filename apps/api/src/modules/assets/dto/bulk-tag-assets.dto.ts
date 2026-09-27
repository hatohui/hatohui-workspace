import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ASSET_BULK_MAX } from '@/modules/assets/assets.constants';

export class BulkTagAssetsDto {
  @ApiProperty({
    example: ['clx1234567890', 'clx0987654321'],
    type: [String],
    maxItems: ASSET_BULK_MAX,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(ASSET_BULK_MAX)
  @ArrayUnique()
  @IsString({ each: true })
  ids: string[];

  @ApiProperty({
    example: ['Full Body', 'wip'],
    type: [String],
    description:
      'Tags to add; matched case-insensitively and never added twice to the same asset',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  tags: string[];
}

export class BulkTagAssetsResultDto {
  @ApiProperty({
    example: ['clx1234567890'],
    type: [String],
    description: 'Ids that were tagged; ids that no longer exist are skipped',
  })
  updatedIds: string[];
}
