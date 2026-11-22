import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TRAVEL_NAME_MAX_LENGTH } from '@/modules/travel-recommendations/travel-recommendations.constants';

export class TravelPlaceCategoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Buffet' })
  name!: string;

  @ApiProperty({ description: 'Places grouped in this place category' })
  placeCount!: number;

  @ApiProperty()
  createdAt!: Date;
}

export class UpdateTravelPlaceCategoryDto {
  @ApiProperty({ required: false, maxLength: TRAVEL_NAME_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(TRAVEL_NAME_MAX_LENGTH)
  name?: string;
}
