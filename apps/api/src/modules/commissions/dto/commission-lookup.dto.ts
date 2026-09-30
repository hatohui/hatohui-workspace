import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  COMMENT_IMAGE_LIMIT,
  CONTACT_PLATFORM_MAX_LENGTH,
  CONTACT_VALUE_MAX_LENGTH,
} from '@/modules/commissions/commissions.constants';

export class CreateClientNoteDto {
  @ApiProperty({
    example: 'Looks great, approved!',
    description: 'May be empty when images are attached',
  })
  @IsString()
  body: string;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Storage keys of images uploaded with this comment',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(COMMENT_IMAGE_LIMIT)
  @IsString({ each: true })
  keys?: string[];

  @ApiProperty({
    required: false,
    description: 'Progress update this comments on; omit for a general note',
  })
  @IsOptional()
  @IsString()
  progressId?: string;
}

export class UpdateClientPreferencesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isHiddenInQueue?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowGalleryPost?: boolean;

  @ApiProperty({
    required: false,
    example: 'Discord',
    description: "A SocialPlatform name, or 'email'",
  })
  @IsOptional()
  @IsString()
  @MaxLength(CONTACT_PLATFORM_MAX_LENGTH)
  contactPlatform?: string;

  @ApiProperty({
    required: false,
    description: "Handle or address on contactPlatform; ignored for 'email'",
  })
  @IsOptional()
  @IsString()
  @MaxLength(CONTACT_VALUE_MAX_LENGTH)
  contactValue?: string;
}
