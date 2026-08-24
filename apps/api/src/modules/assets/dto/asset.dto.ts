import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { AssetSource, AssetThumbnailStatus } from '@prisma/client';

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
    enum: AssetThumbnailStatus,
    example: AssetThumbnailStatus.READY,
  })
  thumbnailStatus: AssetThumbnailStatus;

  @ApiProperty({ example: 'character-sketch.png' })
  filename: string;

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
}

export class UpdateAssetDto {
  @ApiProperty({
    example: ['references', 'character'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
