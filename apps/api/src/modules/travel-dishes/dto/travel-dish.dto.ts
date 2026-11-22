import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  TRAVEL_MAX_CATEGORIES,
  TRAVEL_MAX_CUISINES,
  TRAVEL_NAME_MAX_LENGTH,
  TRAVEL_NOTE_MAX_LENGTH,
} from '@/modules/travel-recommendations/travel-recommendations.constants';
import {
  TravelCreatorDto,
  TravelRecommendationDto,
} from '@/modules/travel-recommendations/dto/travel-recommendation.dto';

export class TravelDishDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Egg coffee' })
  name!: string;

  @ApiProperty({ type: [String], example: ['Vietnamese'] })
  cuisines!: string[];

  @ApiProperty({ type: [String], example: ['Coffee'] })
  categories!: string[];

  @ApiProperty({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty({
    type: [String],
    description: 'Allergen tag keys found in any recommendation of this dish',
  })
  allergens!: string[];

  @ApiProperty({ description: 'Places recommended for this dish' })
  placeCount!: number;

  @ApiProperty({
    nullable: true,
    type: Number,
    description:
      'Places in the requested area or country; null when no location was given',
  })
  localPlaceCount!: number | null;

  @ApiProperty({ nullable: true, type: String })
  imageKey!: string | null;

  @ApiProperty({ nullable: true, type: String })
  imageUrl!: string | null;

  @ApiProperty({ nullable: true, type: String })
  thumbnailUrl!: string | null;

  @ApiProperty({ nullable: true, type: String })
  previewUrl!: string | null;

  @ApiProperty({ nullable: true, type: String })
  coverImageUrl!: string | null;

  @ApiProperty({ type: TravelCreatorDto, nullable: true })
  createdBy!: TravelCreatorDto | null;

  @ApiProperty()
  createdAt!: Date;
}

export class TravelDishDetailDto extends TravelDishDto {
  @ApiProperty({ type: TravelRecommendationDto, isArray: true })
  recommendations!: TravelRecommendationDto[];
}

export class CreateTravelDishDto {
  @ApiProperty({ maxLength: TRAVEL_NAME_MAX_LENGTH })
  @IsString()
  @MinLength(1)
  @MaxLength(TRAVEL_NAME_MAX_LENGTH)
  name!: string;

  @ApiProperty({
    type: [String],
    required: false,
    maxItems: TRAVEL_MAX_CUISINES,
    description: 'Cuisine tags, found or created by name',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(TRAVEL_MAX_CUISINES)
  @IsString({ each: true })
  @MaxLength(TRAVEL_NAME_MAX_LENGTH, { each: true })
  cuisines?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    maxItems: TRAVEL_MAX_CATEGORIES,
    description: 'Food category tags, found or created by name',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(TRAVEL_MAX_CATEGORIES)
  @IsString({ each: true })
  @MaxLength(TRAVEL_NAME_MAX_LENGTH, { each: true })
  categories?: string[];

  @ApiProperty({ required: false, maxLength: TRAVEL_NOTE_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(TRAVEL_NOTE_MAX_LENGTH)
  description?: string;

  @ApiProperty({
    required: false,
    nullable: true,
    type: String,
    description: 'Staged upload key, existing key, or null to clear',
  })
  @IsOptional()
  @IsString()
  imageKey?: string | null;
}

export class UpdateTravelDishDto extends PartialType(CreateTravelDishDto) {}

const toList = ({ value }: { value: unknown }) =>
  value === undefined
    ? undefined
    : ([] as unknown[])
        .concat(value)
        .flatMap((item) => String(item).split(','))
        .map((item) => item.trim())
        .filter(Boolean);

export class TravelDishQueryDto {
  @ApiProperty({ required: false, description: 'Match name or cuisine' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Only dishes tagged with any of these cuisines',
  })
  @IsOptional()
  @Transform(toList)
  @IsString({ each: true })
  cuisines?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Only dishes tagged with any of these food categories',
  })
  @IsOptional()
  @Transform(toList)
  @IsString({ each: true })
  foodCategories?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Only dishes served at places with any of these categories',
  })
  @IsOptional()
  @Transform(toList)
  @IsString({ each: true })
  placeCategories?: string[];

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
    description:
      'Hide dishes with any recommendation containing these allergens',
  })
  @IsOptional()
  @Transform(toList)
  @IsString({ each: true })
  excludeAllergens?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Only dishes with a recommendation having every listed tag',
  })
  @IsOptional()
  @Transform(toList)
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description:
      'Only dishes with a recommendation having none of these tag keys',
  })
  @IsOptional()
  @Transform(toList)
  @IsString({ each: true })
  excludeTags?: string[];

  @ApiProperty({
    required: false,
    description:
      'Dishes whose cuisines belong to this area or its country, or served in this area; sorted by local availability',
  })
  @IsOptional()
  @IsString()
  areaId?: string;

  @ApiProperty({
    required: false,
    description:
      'Dishes whose cuisines belong to this country, or served in it; sorted by local availability',
  })
  @IsOptional()
  @IsString()
  countryId?: string;
}
