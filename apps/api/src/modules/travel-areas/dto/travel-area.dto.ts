import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TravelBulkNamesDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';
import { TRAVEL_NAME_MAX_LENGTH } from '@/modules/travel-recommendations/travel-recommendations.constants';

export class TravelAreaDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  countryId!: string;

  @ApiProperty({ example: 'Ho Chi Minh City' })
  name!: string;

  @ApiProperty({ description: 'Places in this area' })
  placeCount!: number;

  @ApiProperty()
  createdAt!: Date;
}

export class BulkCreateTravelAreasDto extends TravelBulkNamesDto {
  @ApiProperty()
  @IsString()
  countryId!: string;
}

export class UpdateTravelAreaDto {
  @ApiProperty({ required: false, maxLength: TRAVEL_NAME_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(TRAVEL_NAME_MAX_LENGTH)
  name?: string;

  @ApiProperty({ required: false, description: 'Move the area to a country' })
  @IsOptional()
  @IsString()
  countryId?: string;
}
