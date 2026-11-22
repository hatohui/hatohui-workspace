import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import {
  TRAVEL_CATALOG_SORTS,
  type TravelCatalogSort,
} from '@/modules/travel-recommendations/travel-recommendations.constants';

export class TravelCatalogSortQueryDto {
  @ApiProperty({
    required: false,
    enum: TRAVEL_CATALOG_SORTS,
    enumName: 'TravelCatalogSort',
    default: 'relevance',
    description:
      'relevance keeps local and search-matched entries first; popular ranks by recommendation count',
  })
  @IsOptional()
  @IsIn(TRAVEL_CATALOG_SORTS)
  sort?: TravelCatalogSort;
}
