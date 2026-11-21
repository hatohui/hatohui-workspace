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
} from 'class-validator';
import {
  TRAVEL_CURRENCIES,
  TRAVEL_MAX_IMAGES,
  TRAVEL_NAME_MAX_LENGTH,
  TRAVEL_NOTE_MAX_LENGTH,
  TRAVEL_URL_MAX_LENGTH,
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

  @ApiProperty({ required: false, maxLength: TRAVEL_NAME_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(TRAVEL_NAME_MAX_LENGTH)
  cuisine?: string;

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
  estimate?: number | null;

  @ApiProperty({ required: false, enum: TRAVEL_CURRENCIES })
  @IsOptional()
  @IsIn(TRAVEL_CURRENCIES)
  currency?: TravelCurrency;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  spicy?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  vegetarian?: boolean;

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
    'cuisine',
    'placeName',
    'placeMapsUrl',
  ] as const),
) {}
