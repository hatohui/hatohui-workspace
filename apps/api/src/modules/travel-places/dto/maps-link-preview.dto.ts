import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { TRAVEL_URL_MAX_LENGTH } from '@/modules/travel-recommendations/travel-recommendations.constants';

export class MapsLinkPreviewRequestDto {
  @ApiProperty({
    maxLength: TRAVEL_URL_MAX_LENGTH,
    example: 'https://maps.app.goo.gl/abc123',
  })
  @IsString()
  @MaxLength(TRAVEL_URL_MAX_LENGTH)
  url!: string;
}

export class MapsLinkPreviewDto {
  @ApiProperty({ nullable: true, type: Number })
  latitude!: number | null;

  @ApiProperty({ nullable: true, type: Number })
  longitude!: number | null;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Place name read from the link, when it names one',
  })
  name!: string | null;
}
