import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
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

  @ApiProperty({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty({ description: 'Places recommended for this dish' })
  placeCount!: number;

  @ApiProperty({ nullable: true, type: String })
  imageKey!: string | null;

  @ApiProperty({ nullable: true, type: String })
  imageUrl!: string | null;

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

const toBoolean = ({ value }: { value: unknown }) =>
  value === undefined ? undefined : [true, 'true'].includes(value as string);

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
    description: 'Only entries added by this @handle',
    example: 'hatohui',
  })
  @IsOptional()
  @IsString()
  by?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  spicy?: boolean;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Only dishes with a recommendation meeting every listed diet',
  })
  @IsOptional()
  @Transform(toList)
  @IsString({ each: true })
  diets?: string[];

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

  @ApiProperty({ required: false, description: 'Only places in this area' })
  @IsOptional()
  @IsString()
  areaId?: string;

  @ApiProperty({ required: false, description: 'Only places in this country' })
  @IsOptional()
  @IsString()
  countryId?: string;
}
