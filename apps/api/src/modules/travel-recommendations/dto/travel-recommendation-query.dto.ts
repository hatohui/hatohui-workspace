import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import {
  TRAVEL_ALLERGEN_TAGS,
  TRAVEL_DIET_TAGS,
  type TravelAllergenTag,
  type TravelDietTag,
} from '@/modules/travel-recommendations/travel-recommendations.constants';

const toBoolean = ({ value }: { value: unknown }) =>
  value === undefined ? undefined : [true, 'true'].includes(value as string);

const toList = ({ value }: { value: unknown }) =>
  value === undefined
    ? undefined
    : ([] as unknown[])
        .concat(value)
        .flatMap((item) => String(item).split(','))
        .map((item) => item.trim())
        .filter(Boolean);

export class TravelRecommendationQueryDto {
  @ApiProperty({
    required: false,
    description: 'Match dish, place, cuisine or note',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cuisine?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dishId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  placeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  spicy?: boolean;

  @ApiProperty({
    required: false,
    enum: TRAVEL_DIET_TAGS,
    enumName: 'TravelDietTag',
    isArray: true,
    description: 'Only dishes that meet every listed diet',
  })
  @IsOptional()
  @Transform(toList)
  @IsIn(TRAVEL_DIET_TAGS, { each: true })
  diets?: TravelDietTag[];

  @ApiProperty({
    required: false,
    enum: TRAVEL_ALLERGEN_TAGS,
    enumName: 'TravelAllergenTag',
    isArray: true,
    description: 'Hide dishes that contain any of these allergens',
  })
  @IsOptional()
  @Transform(toList)
  @IsIn(TRAVEL_ALLERGEN_TAGS, { each: true })
  excludeAllergens?: TravelAllergenTag[];
}
