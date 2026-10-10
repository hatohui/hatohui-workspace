import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString, MaxLength } from 'class-validator';
import {
  ABOUT_BODY_MAX_LENGTH,
  ABOUT_FACT_MAX_LENGTH,
  ABOUT_FACTS_MAX_COUNT,
  ABOUT_HEADLINE_MAX_LENGTH,
  ABOUT_INTRO_MAX_LENGTH,
} from '@/modules/artist-about/artist-about.constants';

export class ArtistAboutDto {
  @ApiProperty()
  headline!: string;

  @ApiProperty()
  intro!: string;

  @ApiProperty({ description: 'Markdown' })
  body!: string;

  @ApiProperty({ type: String, isArray: true })
  facts!: string[];
}

export class UpdateArtistAboutDto {
  @ApiProperty({ maxLength: ABOUT_HEADLINE_MAX_LENGTH })
  @IsString()
  @MaxLength(ABOUT_HEADLINE_MAX_LENGTH)
  headline!: string;

  @ApiProperty({ maxLength: ABOUT_INTRO_MAX_LENGTH })
  @IsString()
  @MaxLength(ABOUT_INTRO_MAX_LENGTH)
  intro!: string;

  @ApiProperty({ maxLength: ABOUT_BODY_MAX_LENGTH, description: 'Markdown' })
  @IsString()
  @MaxLength(ABOUT_BODY_MAX_LENGTH)
  body!: string;

  @ApiProperty({
    type: String,
    isArray: true,
    maxItems: ABOUT_FACTS_MAX_COUNT,
  })
  @IsArray()
  @ArrayMaxSize(ABOUT_FACTS_MAX_COUNT)
  @IsString({ each: true })
  @MaxLength(ABOUT_FACT_MAX_LENGTH, { each: true })
  facts!: string[];
}
