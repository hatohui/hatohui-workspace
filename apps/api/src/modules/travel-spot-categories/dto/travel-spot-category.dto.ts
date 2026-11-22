import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TRAVEL_NAME_MAX_LENGTH } from '@/modules/travel-recommendations/travel-recommendations.constants';

export class TravelSpotCategoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Museum' })
  name!: string;

  @ApiProperty({ description: 'Spots grouped in this spot category' })
  spotCount!: number;

  @ApiProperty()
  createdAt!: Date;
}

export class UpdateTravelSpotCategoryDto {
  @ApiProperty({ required: false, maxLength: TRAVEL_NAME_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(TRAVEL_NAME_MAX_LENGTH)
  name?: string;
}
