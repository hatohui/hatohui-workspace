import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { TravelBulkNamesDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';
import { TravelPlaceInputDto } from '@/modules/travel-recommendations/dto/travel-place-input.dto';
import { TravelRecommendationQueryDto } from '@/modules/travel-recommendations/dto/travel-recommendation-query.dto';
import {
  TravelCreatorDto,
  TravelPlaceSummaryDto,
  TravelRecommendationDto,
} from '@/modules/travel-recommendations/dto/travel-recommendation.dto';

export class TravelPlaceDto extends TravelPlaceSummaryDto {
  @ApiProperty({ nullable: true, type: String })
  note!: string | null;

  @ApiProperty({
    type: [String],
    description: 'Allergen tag keys found in any dish recommended here',
  })
  allergens!: string[];

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

export class TravelPlaceQueryDto extends PickType(
  TravelRecommendationQueryDto,
  [
    'by',
    'areaId',
    'countryId',
    'cuisines',
    'spicy',
    'vegetarian',
    'excludeAllergens',
    'tags',
  ] as const,
) {
  @ApiProperty({ required: false, description: 'Match name or address' })
  @IsOptional()
  @IsString()
  q?: string;
}

export class BulkCreateTravelPlacesDto extends TravelBulkNamesDto {
  @ApiProperty({ required: false, description: 'Area for every new place' })
  @IsOptional()
  @IsString()
  areaId?: string;
}
