import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import {
  TRAVEL_NAME_MAX_LENGTH,
  TRAVEL_NOTE_MAX_LENGTH,
} from '@/modules/travel-recommendations/travel-recommendations.constants';
import {
  TravelCreatorDto,
  TravelRecommendationDto,
} from '@/modules/travel-recommendations/dto/travel-recommendation.dto';

export class TravelDishDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Egg coffee' })
  name!: string;

  @ApiProperty({ nullable: true, type: String })
  cuisine!: string | null;

  @ApiProperty({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty({ description: 'Places recommended for this dish' })
  placeCount!: number;

  @ApiProperty({ nullable: true, type: String })
  coverImageUrl!: string | null;

  @ApiProperty({ type: TravelCreatorDto, nullable: true })
  createdBy!: TravelCreatorDto | null;
}

export class TravelDishDetailDto extends TravelDishDto {
  @ApiProperty({ type: TravelRecommendationDto, isArray: true })
  recommendations!: TravelRecommendationDto[];
}

export class CreateTravelDishDto {
  @ApiProperty({ maxLength: TRAVEL_NAME_MAX_LENGTH })
  @IsString()
  @MinLength(1)
  @MaxLength(TRAVEL_NAME_MAX_LENGTH)
  name!: string;

  @ApiProperty({ required: false, maxLength: TRAVEL_NAME_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(TRAVEL_NAME_MAX_LENGTH)
  cuisine?: string;

  @ApiProperty({ required: false, maxLength: TRAVEL_NOTE_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(TRAVEL_NOTE_MAX_LENGTH)
  description?: string;
}

export class UpdateTravelDishDto extends PartialType(CreateTravelDishDto) {}

export class TravelDishQueryDto {
  @ApiProperty({ required: false, description: 'Match name or cuisine' })
  @IsOptional()
  @IsString()
  q?: string;
}
