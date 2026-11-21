import { ApiProperty } from '@nestjs/swagger';
import type { TravelPriceLevel } from '@prisma/client';
import {
  TRAVEL_ALLERGEN_TAGS,
  TRAVEL_DIET_TAGS,
  TRAVEL_PRICE_LEVELS,
  type TravelAllergenTag,
  type TravelDietTag,
} from '@/modules/travel-recommendations/travel-recommendations.constants';

export class TravelImageDto {
  @ApiProperty({ description: 'Storage key; send it back to keep the image' })
  key!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Uploader user id',
  })
  createdById!: string | null;
}

export class TravelCreatorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ description: 'Profile display name, else the account name' })
  name!: string;

  @ApiProperty({ nullable: true, type: String })
  avatarUrl!: string | null;
}

export class TravelDishSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Egg coffee' })
  name!: string;

  @ApiProperty({ type: [String], example: ['Vietnamese'] })
  cuisines!: string[];
}

export class TravelPlaceSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: '21Grams Vegetarian' })
  name!: string;

  @ApiProperty({ nullable: true, type: String })
  address!: string | null;

  @ApiProperty({ nullable: true, type: String })
  city!: string | null;

  @ApiProperty({ nullable: true, type: String })
  mapsUrl!: string | null;

  @ApiProperty({ nullable: true, type: Number })
  latitude!: number | null;

  @ApiProperty({ nullable: true, type: Number })
  longitude!: number | null;
}

export class TravelRecommendationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: TravelDishSummaryDto })
  dish!: TravelDishSummaryDto;

  @ApiProperty({ type: TravelPlaceSummaryDto })
  place!: TravelPlaceSummaryDto;

  @ApiProperty({ nullable: true, type: String })
  note!: string | null;

  @ApiProperty({
    nullable: true,
    type: Number,
    description: 'Lowest price per person, in currency units',
  })
  priceMin!: number | null;

  @ApiProperty({
    nullable: true,
    type: Number,
    description: 'Highest price per person; equal to priceMin for one price',
  })
  priceMax!: number | null;

  @ApiProperty({
    nullable: true,
    enum: TRAVEL_PRICE_LEVELS,
    enumName: 'TravelPriceLevel',
    description: 'Rough price level when no amount is known',
  })
  priceLevel!: TravelPriceLevel | null;

  @ApiProperty({ example: 'VND' })
  currency!: string;

  @ApiProperty()
  spicy!: boolean;

  @ApiProperty({
    enum: TRAVEL_DIET_TAGS,
    enumName: 'TravelDietTag',
    isArray: true,
  })
  diets!: TravelDietTag[];

  @ApiProperty({
    enum: TRAVEL_ALLERGEN_TAGS,
    enumName: 'TravelAllergenTag',
    isArray: true,
    description: 'Allergens the dish contains',
  })
  allergens!: TravelAllergenTag[];

  @ApiProperty({ type: TravelImageDto, isArray: true })
  images!: TravelImageDto[];

  @ApiProperty({ type: TravelCreatorDto, nullable: true })
  createdBy!: TravelCreatorDto | null;

  @ApiProperty()
  createdAt!: Date;
}
