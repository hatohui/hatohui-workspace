import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

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
