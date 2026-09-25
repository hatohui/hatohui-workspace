import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_UPLOADER_NAME_LENGTH,
} from '@/modules/images/images.constants';

export const ALLOWED_IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const;

export class SignImageDto {
  @ApiProperty({ example: 'profile-photo.jpg' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    example: 'image/jpeg',
    enum: ALLOWED_IMAGE_CONTENT_TYPES,
  })
  @IsIn(ALLOWED_IMAGE_CONTENT_TYPES)
  contentType: string;

  @ApiProperty({
    example: 204800,
    description: 'File size in bytes; the upload must match it exactly',
    maximum: MAX_IMAGE_UPLOAD_BYTES,
  })
  @IsInt()
  @Min(1)
  @Max(MAX_IMAGE_UPLOAD_BYTES)
  size: number;

  @ApiProperty({
    required: false,
    example: 'Jane Doe',
    description: 'Required when not signed in; names the upload folder',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_UPLOADER_NAME_LENGTH)
  uploaderName?: string;
}

export class SignedImageDto {
  @ApiProperty({
    description: 'Presigned PUT URL the client uploads the file bytes to',
  })
  uploadUrl: string;

  @ApiProperty({ description: 'Object key the file was signed for' })
  key: string;

  @ApiProperty({
    description: 'Public URL the image is reachable at once uploaded',
  })
  publicUrl: string;

  @ApiProperty({ description: 'Seconds until uploadUrl expires' })
  expiresIn: number;
}
