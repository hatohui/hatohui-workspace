import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { TravelPlaceInputDto } from '@/modules/travel-recommendations/dto/travel-place-input.dto';
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

export class CreateTravelPlaceDto extends TravelPlaceInputDto {}

export class UpdateTravelPlaceDto extends PartialType(CreateTravelPlaceDto) {}

export class TravelPlaceQueryDto {
  @ApiProperty({ required: false, description: 'Match name, address or city' })
  @IsOptional()
  @IsString()
  q?: string;
}
