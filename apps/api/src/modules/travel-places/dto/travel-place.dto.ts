import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  TRAVEL_NAME_MAX_LENGTH,
  TRAVEL_NOTE_MAX_LENGTH,
  TRAVEL_URL_MAX_LENGTH,
} from '@/modules/travel-recommendations/travel-recommendations.constants';
import {
  TravelCreatorDto,
  TravelPlaceSummaryDto,
  TravelRecommendationDto,
} from '@/modules/travel-recommendations/dto/travel-recommendation.dto';

export class TravelPlaceDto extends TravelPlaceSummaryDto {
  @ApiProperty({ nullable: true, type: String })
  note!: string | null;

  @ApiProperty({ description: 'Dishes recommended here' })
  dishCount!: number;

  @ApiProperty({ nullable: true, type: String })
  coverImageUrl!: string | null;

  @ApiProperty({ type: TravelCreatorDto, nullable: true })
  createdBy!: TravelCreatorDto | null;
}

export class TravelPlaceDetailDto extends TravelPlaceDto {
  @ApiProperty({ type: TravelRecommendationDto, isArray: true })
  recommendations!: TravelRecommendationDto[];
}

export class CreateTravelPlaceDto {
  @ApiProperty({ maxLength: TRAVEL_NAME_MAX_LENGTH })
  @IsString()
  @MinLength(1)
  @MaxLength(TRAVEL_NAME_MAX_LENGTH)
  name!: string;

  @ApiProperty({ required: false, maxLength: TRAVEL_NOTE_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(TRAVEL_NOTE_MAX_LENGTH)
  address?: string;

  @ApiProperty({ required: false, maxLength: TRAVEL_NAME_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(TRAVEL_NAME_MAX_LENGTH)
  city?: string;

  @ApiProperty({
    required: false,
    maxLength: TRAVEL_URL_MAX_LENGTH,
    description: 'Google Maps link; coordinates are read from it when present',
  })
  @IsOptional()
  @IsString()
  @MaxLength(TRAVEL_URL_MAX_LENGTH)
  mapsUrl?: string;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiProperty({ required: false, maxLength: TRAVEL_NOTE_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(TRAVEL_NOTE_MAX_LENGTH)
  note?: string;
}

export class UpdateTravelPlaceDto extends PartialType(CreateTravelPlaceDto) {}

export class TravelPlaceQueryDto {
  @ApiProperty({ required: false, description: 'Match name, address or city' })
  @IsOptional()
  @IsString()
  q?: string;
}
