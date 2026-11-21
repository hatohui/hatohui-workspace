import { ApiProperty } from '@nestjs/swagger';
import type { TravelPriceLevel } from '@prisma/client';
import { TRAVEL_PRICE_LEVELS } from '@/modules/travel-recommendations/travel-recommendations.constants';

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

  @ApiProperty({ nullable: true, type: String, example: 'hatohui' })
  handle!: string | null;
}

export class TravelDishSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Egg coffee' })
  name!: string;

  @ApiProperty({ type: [String], example: ['Vietnamese'] })
  cuisines!: string[];
}

export class TravelPlaceAreaDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Ho Chi Minh City' })
  name!: string;

  @ApiProperty()
  countryId!: string;

  @ApiProperty({ example: 'Vietnam' })
  countryName!: string;
}

export class TravelPlaceSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: '21Grams Vegetarian' })
  name!: string;

  @ApiProperty({ type: TravelPlaceAreaDto, nullable: true })
  area!: TravelPlaceAreaDto | null;

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
    type: [String],
    description: 'Diet tag keys, e.g. vegetarian',
  })
  diets!: string[];

  @ApiProperty({
    type: [String],
    description: 'Allergen tag keys the dish contains, e.g. peanuts',
  })
  allergens!: string[];

  @ApiProperty({ type: TravelImageDto, isArray: true })
  images!: TravelImageDto[];

  @ApiProperty({ type: TravelCreatorDto, nullable: true })
  createdBy!: TravelCreatorDto | null;

  @ApiProperty()
  createdAt!: Date;
}
