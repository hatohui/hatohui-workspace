import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { TravelCatalogSortQueryDto } from '@/modules/travel-recommendations/dto/travel-catalog-sort-query.dto';
import { TravelBulkNamesDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';
import { TravelPlaceInputDto } from '@/modules/travel-recommendations/dto/travel-place-input.dto';
import {
  TravelCreatorDto,
  TravelImageDto,
  TravelPlaceSummaryDto,
} from '@/modules/travel-recommendations/dto/travel-recommendation.dto';
import {
  TRAVEL_MAX_IMAGES,
  TRAVEL_MAX_TAGS,
  TRAVEL_NAME_MAX_LENGTH,
} from '@/modules/travel-recommendations/travel-recommendations.constants';

export class TravelSpotDto extends TravelPlaceSummaryDto {
  @ApiProperty({ nullable: true, type: String })
  note!: string | null;

  @ApiProperty({
    type: [String],
    description: 'Special tag keys, e.g. must-visit, free-entry',
  })
  specials!: string[];

  @ApiProperty({
    type: [String],
    description: 'General tag keys, e.g. outdoor, museum, family-friendly',
  })
  tags!: string[];

  @ApiProperty({ type: TravelImageDto, isArray: true })
  images!: TravelImageDto[];

  @ApiProperty({ nullable: true, type: String })
  coverImageUrl!: string | null;

  @ApiProperty({ type: TravelCreatorDto, nullable: true })
  createdBy!: TravelCreatorDto | null;

  @ApiProperty()
  createdAt!: Date;
}

export class CreateTravelSpotDto extends TravelPlaceInputDto {
  @ApiProperty({
    type: [String],
    required: false,
    maxItems: TRAVEL_MAX_TAGS,
    description: 'Special tag keys or names, found or created',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(TRAVEL_MAX_TAGS)
  @IsString({ each: true })
  @MaxLength(TRAVEL_NAME_MAX_LENGTH, { each: true })
  specials?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    maxItems: TRAVEL_MAX_TAGS,
    description: 'General tag keys or names, found or created',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(TRAVEL_MAX_TAGS)
  @IsString({ each: true })
  @MaxLength(TRAVEL_NAME_MAX_LENGTH, { each: true })
  tags?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    maxItems: TRAVEL_MAX_IMAGES,
    description: 'Staged upload keys or existing spot image keys',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(TRAVEL_MAX_IMAGES)
  @IsString({ each: true })
  imageKeys?: string[];
}

export class UpdateTravelSpotDto extends PartialType(CreateTravelSpotDto) {}

const toList = ({ value }: { value: unknown }) =>
  value === undefined
    ? undefined
    : ([] as unknown[])
        .concat(value)
        .flatMap((item) => String(item).split(','))
        .map((item) => item.trim())
        .filter(Boolean);

export class TravelSpotQueryDto extends TravelCatalogSortQueryDto {
  @ApiProperty({
    required: false,
    description: 'Match name, category, address, note, or area',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Only spots tagged with any of these spot categories',
  })
  @IsOptional()
  @Transform(toList)
  @IsString({ each: true })
  spotCategories?: string[];

  @ApiProperty({
    required: false,
    description: 'Only entries added by this @handle',
    example: 'hatohui',
  })
  @IsOptional()
  @IsString()
  by?: string;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Only spots having every listed tag key',
  })
  @IsOptional()
  @Transform(toList)
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Only spots having none of these tag keys',
  })
  @IsOptional()
  @Transform(toList)
  @IsString({ each: true })
  excludeTags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  areaId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  countryId?: string;
}

export class TravelSpotPageQueryDto extends TravelSpotQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 16 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class PaginatedTravelSpotsDto {
  @ApiProperty({ type: TravelSpotDto, isArray: true })
  items!: TravelSpotDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty({ description: 'Whether another page can be requested' })
  hasMore!: boolean;
}

export class BulkCreateTravelSpotsDto extends TravelBulkNamesDto {
  @ApiProperty({ required: false, description: 'Area for every new spot' })
  @IsOptional()
  @IsString()
  areaId?: string;
}
