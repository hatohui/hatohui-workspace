import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString } from 'class-validator';
import { TRAVEL_MAX_USER_ALLERGENS } from '@/modules/travel-allergies/travel-allergies.constants';

export class TravelAllergiesDto {
  @ApiProperty({
    type: [String],
    description: 'Allergen tag keys the signed-in user avoids',
    example: ['peanuts', 'shellfish'],
  })
  allergens!: string[];
}

export class UpdateTravelAllergiesDto {
  @ApiProperty({ type: [String], example: ['peanuts'] })
  @IsArray()
  @ArrayMaxSize(TRAVEL_MAX_USER_ALLERGENS)
  @IsString({ each: true })
  allergens!: string[];
}
