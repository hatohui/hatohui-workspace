import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TravelPlaceInputDto } from '@/modules/travel-recommendations/dto/travel-place-input.dto';
import {
  TRAVEL_MAX_CATEGORIES,
  TRAVEL_MAX_CUISINES,
  TRAVEL_MAX_IMAGES,
  TRAVEL_MAX_VISIT_DISHES,
  TRAVEL_NAME_MAX_LENGTH,
  TRAVEL_NOTE_MAX_LENGTH,
} from '@/modules/travel-recommendations/travel-recommendations.constants';

export class TravelRecommendationDishInputDto {
  @ApiProperty({ required: false, description: 'An existing dish' })
  @IsOptional()
  @IsString()
  dishId?: string;

  @ApiProperty({
    required: false,
    maxLength: TRAVEL_NAME_MAX_LENGTH,
    description: 'Dish name, found or created when dishId is absent',
  })
  @IsOptional()
  @IsString()
  @MaxLength(TRAVEL_NAME_MAX_LENGTH)
  dishName?: string;

  @ApiProperty({
    type: [String],
    required: false,
    maxItems: TRAVEL_MAX_CUISINES,
    description: 'Cuisine tags for a newly created dish, found or created',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(TRAVEL_MAX_CUISINES)
  @IsString({ each: true })
  @MaxLength(TRAVEL_NAME_MAX_LENGTH, { each: true })
  cuisines?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    maxItems: TRAVEL_MAX_CATEGORIES,
    description:
      'Food category tags for a newly created dish, found or created',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(TRAVEL_MAX_CATEGORIES)
  @IsString({ each: true })
  @MaxLength(TRAVEL_NAME_MAX_LENGTH, { each: true })
  foodCategories?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Allergen tag keys or names this dish contains',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];
}

export class CreateTravelRecommendationDto {
  @ApiProperty({ required: false, description: 'An existing place' })
  @IsOptional()
  @IsString()
  placeId?: string;

  @ApiProperty({
    required: false,
    type: TravelPlaceInputDto,
    description: 'A new place, created when placeId is absent',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TravelPlaceInputDto)
  place?: TravelPlaceInputDto;

  @ApiProperty({
    type: TravelRecommendationDishInputDto,
    isArray: true,
    maxItems: TRAVEL_MAX_VISIT_DISHES,
    description: 'Dishes worth ordering at this place, in order',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(TRAVEL_MAX_VISIT_DISHES)
  @ValidateNested({ each: true })
  @Type(() => TravelRecommendationDishInputDto)
  dishes!: TravelRecommendationDishInputDto[];

  @ApiProperty({ required: false, maxLength: TRAVEL_NOTE_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(TRAVEL_NOTE_MAX_LENGTH)
  note?: string;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Special tag keys or names (e.g. spicy, vegetarian, michelin)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specials?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: 'General tag keys or names (e.g. bread, meat)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    maxItems: TRAVEL_MAX_IMAGES,
    description: 'Ordered image keys: staged uploads or ones already attached',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(TRAVEL_MAX_IMAGES)
  @IsString({ each: true })
  imageKeys?: string[];
}

export class UpdateTravelRecommendationDto extends PartialType(
  OmitType(CreateTravelRecommendationDto, ['place'] as const),
) {
  @ApiProperty({
    required: false,
    description: "Area for the recommendation's place; empty clears it",
  })
  @IsOptional()
  @IsString()
  placeAreaId?: string;
}
