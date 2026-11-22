import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TravelPlaceInputDto } from '@/modules/travel-recommendations/dto/travel-place-input.dto';
import type { TravelPriceLevel } from '@prisma/client';
import {
  TRAVEL_CURRENCIES,
  TRAVEL_MAX_CUISINES,
  TRAVEL_MAX_IMAGES,
  TRAVEL_NAME_MAX_LENGTH,
  TRAVEL_NOTE_MAX_LENGTH,
  TRAVEL_PRICE_LEVELS,
  type TravelCurrency,
} from '@/modules/travel-recommendations/travel-recommendations.constants';

export class CreateTravelRecommendationDto {
  @ApiProperty({ required: false, description: 'An existing dish' })
  @IsOptional()
  @IsString()
  dishId?: string;

  @ApiProperty({
    required: false,
    maxLength: TRAVEL_NAME_MAX_LENGTH,
    description: 'Dish name, found or created when dishId is absent',
  })
  @IsOptional()
  @IsString()
  @MaxLength(TRAVEL_NAME_MAX_LENGTH)
  dishName?: string;

  @ApiProperty({
    type: [String],
    required: false,
    maxItems: TRAVEL_MAX_CUISINES,
    description: 'Cuisine tags for a newly created dish, found or created',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(TRAVEL_MAX_CUISINES)
  @IsString({ each: true })
  @MaxLength(TRAVEL_NAME_MAX_LENGTH, { each: true })
  cuisines?: string[];

  @ApiProperty({ required: false, description: 'An existing place' })
  @IsOptional()
  @IsString()
  placeId?: string;

  @ApiProperty({
    required: false,
    type: TravelPlaceInputDto,
    description: 'A new place, created when placeId is absent',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TravelPlaceInputDto)
  place?: TravelPlaceInputDto;

  @ApiProperty({ required: false, maxLength: TRAVEL_NOTE_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(TRAVEL_NOTE_MAX_LENGTH)
  note?: string;

  @ApiProperty({ required: false, nullable: true, type: Number, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priceMin?: number | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: Number,
    minimum: 0,
    description: 'Leave equal to priceMin, or empty, for a single price',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  priceMax?: number | null;

  @ApiProperty({
    required: false,
    nullable: true,
    enum: TRAVEL_PRICE_LEVELS,
    enumName: 'TravelPriceLevel',
  })
  @IsOptional()
  @IsIn(TRAVEL_PRICE_LEVELS)
  priceLevel?: TravelPriceLevel | null;

  @ApiProperty({ required: false, enum: TRAVEL_CURRENCIES })
  @IsOptional()
  @IsIn(TRAVEL_CURRENCIES)
  currency?: TravelCurrency;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  spicy?: boolean;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Diet tag keys',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  diets?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Allergen tag keys or names',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: 'General tag keys or names (e.g. bread, meat)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    maxItems: TRAVEL_MAX_IMAGES,
    description: 'Ordered image keys: staged uploads or ones already attached',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(TRAVEL_MAX_IMAGES)
  @IsString({ each: true })
  imageKeys?: string[];
}

export class UpdateTravelRecommendationDto extends PartialType(
  OmitType(CreateTravelRecommendationDto, [
    'dishName',
    'cuisines',
    'place',
  ] as const),
) {}
