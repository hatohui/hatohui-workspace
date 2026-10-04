import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { AssetSource, AssetThumbnailStatus } from '@prisma/client';
import {
  ASSET_DESCRIPTION_MAX_LENGTH,
  ASSET_TITLE_MAX_LENGTH,
} from '@/modules/assets/assets.constants';

export class AssetDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ enum: AssetSource, example: AssetSource.UPLOAD })
  source: AssetSource;

  @ApiProperty({ example: 'uploads/clx1234567890/abc123.jpg', nullable: true })
  key: string | null;

  @ApiProperty({
    example:
      'http://localhost:9010/hatohui-dev/uploads/clx1234567890/abc123.jpg',
  })
  publicUrl: string;

  @ApiProperty({
    example: 'http://localhost:9010/hatohui-dev/art/assets/thumbnails/abc.webp',
    nullable: true,
  })
  thumbnailUrl: string | null;

  @ApiProperty({
    example: 'http://localhost:9010/hatohui-dev/art/assets/previews/abc.webp',
    nullable: true,
    description: 'Large WebP for on-page viewing; the original is publicUrl',
  })
  previewUrl: string | null;

  @ApiProperty({
    enum: AssetThumbnailStatus,
    example: AssetThumbnailStatus.READY,
  })
  thumbnailStatus: AssetThumbnailStatus;

  @ApiProperty({ example: 'character-sketch.png' })
  filename: string;

  @ApiProperty({ example: 'Mira at the café', nullable: true, type: String })
  title: string | null;

  @ApiProperty({
    example: 'Commission for Mira, warm evening palette.',
    nullable: true,
    type: String,
  })
  description: string | null;

  @ApiProperty({ example: 'image/png' })
  contentType: string;

  @ApiProperty({ example: 245678, description: 'File size in bytes' })
  size: number;

  @ApiProperty({ example: 1920, nullable: true })
  width: number | null;

  @ApiProperty({ example: 1080, nullable: true })
  height: number | null;

  @ApiProperty({ example: ['references', 'character'], type: [String] })
  tags: string[];

  @ApiProperty({
    type: [String],
    description: 'Projects this piece is shown in',
  })
  projectIds: string[];

  @ApiProperty({
    description: 'Marked private by the artist, so only they can see it',
  })
  isPrivate: boolean;

  @ApiProperty({
    description: 'In a private project, which keeps it private too',
  })
  inPrivateProject: boolean;

  @ApiProperty({
    nullable: true,
    description: 'Id of the account that uploaded this asset',
  })
  uploadedById: string | null;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  updatedAt: string;
}

export class CreateAssetDto {
  @ApiProperty({
    example: 'uploads/clx1234567890/abc123.jpg',
    description:
      'Object key returned by POST /images/sign. Exactly one of key/externalUrl is required.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  key?: string;

  @ApiProperty({
    example: 'https://example.com/some-art.png',
    description:
      'Externally hosted image URL, as an alternative to uploading via key. Exactly one of key/externalUrl is required.',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  externalUrl?: string;

  @ApiProperty({ example: 'character-sketch.png', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  filename?: string;

  @ApiProperty({ example: 'image/png', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  contentType?: string;

  @ApiProperty({ example: 245678, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  size?: number;

  @ApiProperty({ example: 1920, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @ApiProperty({ example: 1080, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;

  @ApiProperty({
    example: ['references', 'character'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 'Mira at the café', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(ASSET_TITLE_MAX_LENGTH)
  title?: string;

  @ApiProperty({
    example: 'Commission for Mira, warm evening palette.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(ASSET_DESCRIPTION_MAX_LENGTH)
  description?: string;
}

export class UpdateAssetDto {
  @ApiProperty({
    example: ['references', 'character'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 'Mira at the café', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(ASSET_TITLE_MAX_LENGTH)
  title?: string;

  @ApiProperty({
    example: 'Commission for Mira, warm evening palette.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(ASSET_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @ApiProperty({
    required: false,
    description: 'Hide this piece from everyone but you',
  })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
