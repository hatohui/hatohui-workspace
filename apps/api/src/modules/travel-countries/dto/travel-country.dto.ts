import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TravelAreaDto } from '@/modules/travel-areas/dto/travel-area.dto';
import {
  TRAVEL_COUNTRY_CODE_PATTERN,
  TRAVEL_NAME_MAX_LENGTH,
} from '@/modules/travel-recommendations/travel-recommendations.constants';

export class TravelCountryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Vietnam' })
  name!: string;

  @ApiProperty({ nullable: true, type: String, example: 'VN' })
  code!: string | null;

  @ApiProperty({ description: 'Places across all its areas' })
  placeCount!: number;

  @ApiProperty({ type: TravelAreaDto, isArray: true })
  areas!: TravelAreaDto[];
}

export class UpdateTravelCountryDto {
  @ApiProperty({ required: false, maxLength: TRAVEL_NAME_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(TRAVEL_NAME_MAX_LENGTH)
  name?: string;

  @ApiProperty({
    required: false,
    description: 'ISO 3166-1 alpha-2 code; empty clears it',
    example: 'VN',
  })
  @IsOptional()
  @IsString()
  @Matches(TRAVEL_COUNTRY_CODE_PATTERN)
  code?: string;
}
