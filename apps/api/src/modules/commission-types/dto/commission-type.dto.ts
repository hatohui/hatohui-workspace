import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CommissionTypeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  artistId: string;

  @ApiProperty({
    example: 'ICON',
    description:
      'Internal slug, derived from label at creation and never shown to the artist',
  })
  key: string;

  @ApiProperty({ example: 'Icon' })
  label: string;

  @ApiProperty({
    description: "Base price, in the artist's currency's smallest unit",
  })
  basePrice: number;

  @ApiProperty({ description: 'Display order, ascending' })
  no: number;

  @ApiProperty()
  active: boolean;

  @ApiProperty({ nullable: true, type: String })
  tagId: string | null;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Name of the linked Tag, used for gallery filtering',
  })
  tagName: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class UpsertCommissionTypeDto {
  @ApiProperty({ example: 'Icon' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description: "Base price, in the artist's currency's smallest unit",
  })
  @IsInt()
  @Min(0)
  basePrice: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  no?: number;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
