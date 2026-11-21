import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import type { TravelPriceLevel, TravelSpiceLevel } from '@prisma/client';
import {
  TRAVEL_ALLERGEN_TAGS,
  TRAVEL_CURRENCIES,
  TRAVEL_DIET_TAGS,
  TRAVEL_MAX_CUISINES,
  TRAVEL_MAX_IMAGES,
  TRAVEL_NAME_MAX_LENGTH,
  TRAVEL_NOTE_MAX_LENGTH,
  TRAVEL_PRICE_LEVELS,
  TRAVEL_SPICE_LEVELS,
  TRAVEL_URL_MAX_LENGTH,
  type TravelAllergenTag,
  type TravelCurrency,
  type TravelDietTag,
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
    maxLength: TRAVEL_NAME_MAX_LENGTH,
    description: 'Place name, created when placeId is absent',
  })
  @IsOptional()
  @IsString()
  @MaxLength(TRAVEL_NAME_MAX_LENGTH)
  placeName?: string;

  @ApiProperty({ required: false, maxLength: TRAVEL_URL_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(TRAVEL_URL_MAX_LENGTH)
  placeMapsUrl?: string;

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

  @ApiProperty({
    required: false,
    enum: TRAVEL_SPICE_LEVELS,
    enumName: 'TravelSpiceLevel',
  })
  @IsOptional()
  @IsIn(TRAVEL_SPICE_LEVELS)
  spiceLevel?: TravelSpiceLevel;

  @ApiProperty({
    required: false,
    enum: TRAVEL_DIET_TAGS,
    enumName: 'TravelDietTag',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsIn(TRAVEL_DIET_TAGS, { each: true })
  diets?: TravelDietTag[];

  @ApiProperty({
    required: false,
    enum: TRAVEL_ALLERGEN_TAGS,
    enumName: 'TravelAllergenTag',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsIn(TRAVEL_ALLERGEN_TAGS, { each: true })
  allergens?: TravelAllergenTag[];

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
    'placeName',
    'placeMapsUrl',
  ] as const),
) {}
