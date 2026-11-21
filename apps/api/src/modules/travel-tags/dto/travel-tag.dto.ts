import { ApiProperty } from '@nestjs/swagger';
import { TravelTagKind } from '@prisma/client';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { TravelBulkNamesDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';
import { TRAVEL_NAME_MAX_LENGTH } from '@/modules/travel-recommendations/travel-recommendations.constants';

export class TravelTagDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'vegetarian' })
  key!: string;

  @ApiProperty({ enum: TravelTagKind, enumName: 'TravelTagKind' })
  kind!: TravelTagKind;

  @ApiProperty({
    nullable: true,
    type: String,
    description:
      'Display name; preset tags leave it empty and are translated by key',
  })
  name!: string | null;

  @ApiProperty({ description: 'Recommendations using this tag' })
  usageCount!: number;
}

export class BulkCreateTravelTagsDto extends TravelBulkNamesDto {
  @ApiProperty({ enum: TravelTagKind, enumName: 'TravelTagKind' })
  @IsEnum(TravelTagKind)
  kind!: TravelTagKind;
}

export class UpdateTravelTagDto {
  @ApiProperty({ maxLength: TRAVEL_NAME_MAX_LENGTH })
  @IsString()
  @MinLength(1)
  @MaxLength(TRAVEL_NAME_MAX_LENGTH)
  name!: string;
}
