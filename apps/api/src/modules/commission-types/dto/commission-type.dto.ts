import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

/** A platform catalog entry. Carries no price — an artist's price for a type
 * is derived from whichever CommissionOption(s) they've configured under it. */
export class CommissionTypeDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    example: 'ICON',
    description: 'Internal slug, derived from label at creation',
  })
  key: string;

  @ApiProperty({ example: 'Icon' })
  label: string;

  @ApiProperty({ description: 'Display order, ascending' })
  no: number;

  @ApiProperty({
    description: 'Whether this type exists in the platform catalog at all',
  })
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

/** A catalog entry joined with the current artist's enablement of it — the
 * shape the artist-facing commission-settings page renders. */
export class ArtistCommissionTypeDto {
  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Id of the ArtistCommissionType row, null if never enabled',
  })
  id: string | null;

  @ApiProperty()
  commissionTypeId: string;

  @ApiProperty({ example: 'ICON' })
  key: string;

  @ApiProperty({ example: 'Icon' })
  label: string;

  @ApiProperty({ description: 'Display order, ascending' })
  no: number;

  @ApiProperty({ description: 'Whether the artist has this type turned on' })
  enabled: boolean;

  @ApiProperty({
    description: 'How many options the artist has configured under this type',
  })
  optionCount: number;

  @ApiProperty({
    nullable: true,
    description:
      "Lowest priced option's price in the artist's currency's smallest unit; null when nothing under this type is priced yet",
  })
  startingPrice: number | null;
}

export class UpsertArtistCommissionTypeDto {
  @ApiProperty()
  @IsBoolean()
  active: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  no?: number;
}
