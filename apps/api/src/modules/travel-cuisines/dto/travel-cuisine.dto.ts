import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { TRAVEL_NAME_MAX_LENGTH } from '@/modules/travel-recommendations/travel-recommendations.constants';

export class TravelCuisineDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Vietnamese' })
  name!: string;

  @ApiProperty({ description: 'Dishes tagged with this cuisine' })
  dishCount!: number;

  @ApiProperty()
  createdAt!: Date;
}

export class UpdateTravelCuisineDto {
  @ApiProperty({ maxLength: TRAVEL_NAME_MAX_LENGTH })
  @IsString()
  @MinLength(1)
  @MaxLength(TRAVEL_NAME_MAX_LENGTH)
  name!: string;
}
