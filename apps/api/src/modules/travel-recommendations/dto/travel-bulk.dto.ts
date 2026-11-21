import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  TRAVEL_BULK_MAX_ITEMS,
  TRAVEL_URL_MAX_LENGTH,
} from '@/modules/travel-recommendations/travel-recommendations.constants';

export class TravelBulkNamesDto {
  @ApiProperty({
    type: [String],
    maxItems: TRAVEL_BULK_MAX_ITEMS,
    description: 'Names to add; ones that already exist are skipped',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(TRAVEL_BULK_MAX_ITEMS)
  @IsString({ each: true })
  @MaxLength(TRAVEL_URL_MAX_LENGTH, { each: true })
  names!: string[];
}

export class TravelBulkResultDto {
  @ApiProperty()
  created!: number;

  @ApiProperty({ description: 'Already saved or unusable entries' })
  skipped!: number;
}
