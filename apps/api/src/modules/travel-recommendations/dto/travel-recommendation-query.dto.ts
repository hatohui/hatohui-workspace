import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

const toBoolean = ({ value }: { value: unknown }) =>
  value === undefined ? undefined : [true, 'true'].includes(value as string);

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

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  vegetarian?: boolean;
}
