import { ApiProperty } from '@nestjs/swagger';

export class TravelImageDto {
  @ApiProperty({ description: 'Storage key; send it back to keep the image' })
  key!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty({ nullable: true, type: String })
  thumbnailUrl!: string | null;

  @ApiProperty({ nullable: true, type: String })
  previewUrl!: string | null;

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

  @ApiProperty({ type: [String], example: ['Coffee'] })
  categories!: string[];

  @ApiProperty({ nullable: true, type: String })
  imageUrl!: string | null;

  @ApiProperty({ nullable: true, type: String })
  thumbnailUrl!: string | null;

  @ApiProperty({ nullable: true, type: String })
  previewUrl!: string | null;
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

  @ApiProperty({ type: [String], example: ['Buffet'] })
  categories!: string[];

  @ApiProperty({ nullable: true, type: String })
  address!: string | null;

  @ApiProperty({ nullable: true, type: String })
  mapsUrl!: string | null;

  @ApiProperty({ nullable: true, type: Number })
  latitude!: number | null;

  @ApiProperty({ nullable: true, type: Number })
  longitude!: number | null;
}

export class TravelRecommendationDishDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: TravelDishSummaryDto })
  dish!: TravelDishSummaryDto;

  @ApiProperty({
    type: [String],
    description: 'Allergen tag keys the dish contains, e.g. peanuts',
  })
  allergens!: string[];
}

export class TravelRecommendationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: TravelPlaceSummaryDto })
  place!: TravelPlaceSummaryDto;

  @ApiProperty({
    type: TravelRecommendationDishDto,
    isArray: true,
    description: 'Dishes worth ordering at this place, in order',
  })
  dishes!: TravelRecommendationDishDto[];

  @ApiProperty({ nullable: true, type: String })
  note!: string | null;

  @ApiProperty({
    type: [String],
    description: 'Special tag keys, e.g. spicy, vegetarian, michelin',
  })
  specials!: string[];

  @ApiProperty({
    type: [String],
    description: 'General tag keys, e.g. bread, meat',
  })
  tags!: string[];

  @ApiProperty({ type: TravelImageDto, isArray: true })
  images!: TravelImageDto[];

  @ApiProperty({ type: TravelCreatorDto, nullable: true })
  createdBy!: TravelCreatorDto | null;

  @ApiProperty()
  createdAt!: Date;
}
