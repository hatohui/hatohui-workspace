import { ApiProperty } from '@nestjs/swagger';
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

export class TravelPlaceInputDto {
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
}
