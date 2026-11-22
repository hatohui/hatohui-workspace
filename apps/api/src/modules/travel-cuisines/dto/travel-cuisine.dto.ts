import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TRAVEL_NAME_MAX_LENGTH } from '@/modules/travel-recommendations/travel-recommendations.constants';

export class TravelCuisineDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Vietnamese' })
  name!: string;

  @ApiProperty({ description: 'Dishes tagged with this cuisine' })
  dishCount!: number;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Country this cuisine belongs to; null for styles like cafe',
  })
  countryId!: string | null;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Area for a regional cuisine; implies its country',
  })
  areaId!: string | null;

  @ApiProperty()
  createdAt!: Date;
}

export class UpdateTravelCuisineDto {
  @ApiProperty({ required: false, maxLength: TRAVEL_NAME_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(TRAVEL_NAME_MAX_LENGTH)
  name?: string;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  countryId?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: String,
    description: 'Setting an area also sets its country',
  })
  @IsOptional()
  @IsString()
  areaId?: string | null;
}
