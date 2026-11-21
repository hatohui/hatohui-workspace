import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ nullable: true, type: String, example: 'Vietnamese' })
  cuisine!: string | null;
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
    description: 'Rough price per person, in currency units',
  })
  estimate!: number | null;

  @ApiProperty({ example: 'VND' })
  currency!: string;

  @ApiProperty()
  spicy!: boolean;

  @ApiProperty()
  vegetarian!: boolean;

  @ApiProperty({ type: TravelImageDto, isArray: true })
  images!: TravelImageDto[];

  @ApiProperty({ type: TravelCreatorDto, nullable: true })
  createdBy!: TravelCreatorDto | null;

  @ApiProperty()
  createdAt!: Date;
}
