import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  CommissionOpeningEndMode,
  CommissionOpeningStatus,
} from '@prisma/client';

export class CommissionOpeningDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  artistId: string;

  @ApiProperty({ enum: CommissionOpeningStatus })
  status: CommissionOpeningStatus;

  @ApiProperty({ enum: CommissionOpeningEndMode })
  endMode: CommissionOpeningEndMode;

  @ApiProperty({ nullable: true, type: String })
  scheduledAt: string | null;

  @ApiProperty({ nullable: true, type: String })
  openedAt: string | null;

  @ApiProperty({ nullable: true, type: String })
  closedAt: string | null;

  @ApiProperty({
    nullable: true,
    description: 'Closes automatically once this many slots are taken',
  })
  slotCap: number | null;

  @ApiProperty({
    nullable: true,
    description: 'Closes automatically at this time regardless of slot count',
  })
  slotCapEndsAt: string | null;

  @ApiProperty({
    nullable: true,
    description:
      'How many non-pending, non-declined commissions this opening has taken',
  })
  slotsTaken: number;

  @ApiProperty({ nullable: true, type: String })
  postTitle: string | null;

  @ApiProperty({ nullable: true, type: Object })
  postBody: object | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class UpsertCommissionOpeningDto {
  @ApiProperty({ enum: CommissionOpeningEndMode })
  @IsEnum(CommissionOpeningEndMode)
  endMode: CommissionOpeningEndMode;

  @ApiProperty({
    required: false,
    description:
      'When to open — omit to open immediately, set in the future to schedule',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({
    required: false,
    description: 'Required when endMode is SLOT_CAP',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  slotCap?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  slotCapEndsAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  postTitle?: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  postBody?: object;
}
