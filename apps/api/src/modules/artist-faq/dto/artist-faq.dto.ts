import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  FAQ_ANSWER_MAX_LENGTH,
  FAQ_MAX_ITEMS,
  FAQ_QUESTION_MAX_LENGTH,
} from '@/modules/artist-faq/artist-faq.constants';

export class FaqItemDto {
  @ApiProperty({ maxLength: FAQ_QUESTION_MAX_LENGTH })
  @IsString()
  @MaxLength(FAQ_QUESTION_MAX_LENGTH)
  question!: string;

  @ApiProperty({ maxLength: FAQ_ANSWER_MAX_LENGTH, description: 'Markdown' })
  @IsString()
  @MaxLength(FAQ_ANSWER_MAX_LENGTH)
  answer!: string;
}

export class ArtistFaqDto {
  @ApiProperty({ type: FaqItemDto, isArray: true })
  items!: FaqItemDto[];
}

export class UpdateArtistFaqDto {
  @ApiProperty({
    type: FaqItemDto,
    isArray: true,
    maxItems: FAQ_MAX_ITEMS,
  })
  @IsArray()
  @ArrayMaxSize(FAQ_MAX_ITEMS)
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  items!: FaqItemDto[];
}
