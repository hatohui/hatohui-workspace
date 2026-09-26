import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ProjectArtworkDto {
  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Gallery asset id; null for older commission-only images',
  })
  assetId: string | null;

  @ApiProperty({ description: 'Small image for grids and cards' })
  thumbnailUrl: string;

  @ApiProperty({ description: 'Full-size image for close viewing' })
  fullUrl: string;
}

export class AddProjectAssetsDto {
  @ApiProperty({ type: [String], description: 'Your gallery asset ids' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  assetIds: string[];
}

export class ProjectDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty()
  artistId: string;

  @ApiProperty({ example: 'Genshin Impact character set' })
  title: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    nullable: true,
    description: 'Tiptap/ProseMirror JSON document describing the brief',
  })
  brief: unknown;

  @ApiProperty({
    description: 'Whether this project is hidden from the public gallery',
  })
  isHidden: boolean;

  @ApiProperty({
    nullable: true,
    description: "First final artwork image from this project's artworks",
  })
  coverImageUrl: string | null;

  @ApiProperty({
    description: 'Number of final artworks attached to this project',
  })
  artworkCount: number;

  @ApiProperty({ type: [String] })
  artworkImages: string[];

  @ApiProperty({ type: ProjectArtworkDto, isArray: true })
  artworks: ProjectArtworkDto[];

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  updatedAt: string;
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Genshin Impact character set' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Tiptap/ProseMirror JSON document describing the brief',
  })
  @IsOptional()
  brief?: object;
}

export class UpdateProjectDto {
  @ApiProperty({ example: 'Genshin Impact character set' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Tiptap/ProseMirror JSON document describing the brief',
  })
  @IsOptional()
  brief?: object;
}

export class UpdateProjectVisibilityDto {
  @ApiProperty()
  @IsBoolean()
  isHidden: boolean;
}
