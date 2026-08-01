import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { AssetDto } from './asset.dto';

export const ASSET_SORT_OPTIONS = [
  'newest',
  'oldest',
  'size',
  'alphabetical',
] as const;
export type AssetSortOption = (typeof ASSET_SORT_OPTIONS)[number];

export class AssetQueryDto {
  @ApiProperty({
    required: false,
    description: 'Match against filename or tags',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ required: false, description: 'Filter by exact tag' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiProperty({
    enum: ASSET_SORT_OPTIONS,
    required: false,
    default: 'newest',
  })
  @IsOptional()
  @IsIn(ASSET_SORT_OPTIONS)
  sort?: AssetSortOption;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}

export class PaginatedAssetsDto {
  @ApiProperty({ type: AssetDto, isArray: true })
  items: AssetDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty({ description: 'Whether another page can be requested' })
  hasMore: boolean;
}
