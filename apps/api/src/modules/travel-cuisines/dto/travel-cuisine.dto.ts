import { ApiProperty } from '@nestjs/swagger';

export class TravelCuisineDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Vietnamese' })
  name!: string;

  @ApiProperty({ description: 'Dishes tagged with this cuisine' })
  dishCount!: number;
}
