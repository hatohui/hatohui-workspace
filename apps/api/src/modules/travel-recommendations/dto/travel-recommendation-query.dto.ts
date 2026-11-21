import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

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

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Only dishes tagged with any of these cuisines',
  })
  @IsOptional()
  @Transform(toList)
  @IsString({ each: true })
  cuisines?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    required: false,
    description: 'Only entries added by this @handle',
    example: 'hatohui',
  })
  @IsOptional()
  @IsString()
  by?: string;

  @ApiProperty({ required: false, description: 'Only places in this area' })
  @IsOptional()
  @IsString()
  areaId?: string;

  @ApiProperty({ required: false, description: 'Only places in this country' })
  @IsOptional()
  @IsString()
  countryId?: string;

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
    type: [String],
    description: 'Only dishes that meet every listed diet',
  })
  @IsOptional()
  @Transform(toList)
  @IsString({ each: true })
  diets?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Hide dishes that contain any of these allergens',
  })
  @IsOptional()
  @Transform(toList)
  @IsString({ each: true })
  excludeAllergens?: string[];
}
