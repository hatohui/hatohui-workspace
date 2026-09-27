import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TagSuggestionDto {
  @ApiProperty({ example: 'full body' })
  name: string;

  @ApiProperty({
    example: 3,
    description: "How many of the caller's assets carry this tag",
  })
  usageCount: number;

  @ApiProperty({
    example: 'Full Body',
    nullable: true,
    description:
      'Label of the commission type this tag feeds examples to, if any',
  })
  commissionTypeLabel: string | null;
}

export class GalleryTagsQueryDto {
  @ApiProperty({
    required: false,
    description: "Only count tags on this uploader's assets",
  })
  @IsOptional()
  @IsString()
  uploadedById?: string;
}
