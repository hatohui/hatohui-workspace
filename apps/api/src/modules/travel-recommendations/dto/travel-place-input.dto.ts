import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  TRAVEL_MAX_CATEGORIES,
  TRAVEL_NAME_MAX_LENGTH,
  TRAVEL_NOTE_MAX_LENGTH,
  TRAVEL_URL_MAX_LENGTH,
} from '@/modules/travel-recommendations/travel-recommendations.constants';

export class TravelPlaceInputDto {
  @ApiProperty({ maxLength: TRAVEL_NAME_MAX_LENGTH })
  @IsString()
  @MinLength(1)
  @MaxLength(TRAVEL_NAME_MAX_LENGTH)
  name!: string;

  @ApiProperty({
    required: false,
    description: 'Area the place is in; empty clears it',
  })
  @IsOptional()
  @IsString()
  areaId?: string;

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
    description:
      'Google Maps link, short maps.app.goo.gl links included; coordinates are read from it when not given',
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

  @ApiProperty({
    type: [String],
    required: false,
    maxItems: TRAVEL_MAX_CATEGORIES,
    description: 'Location category tags, found or created by name',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(TRAVEL_MAX_CATEGORIES)
  @IsString({ each: true })
  @MaxLength(TRAVEL_NAME_MAX_LENGTH, { each: true })
  categories?: string[];
}
