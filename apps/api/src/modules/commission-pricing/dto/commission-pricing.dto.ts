import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PriceMode } from '@prisma/client';

export { PriceMode };

export class CommissionOptionPricingDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  artistId: string;

  @ApiProperty({
    example: 'SKETCHED',
    description:
      'Internal slug, derived from label at creation and never shown to the artist',
  })
  key: string;

  @ApiProperty({ example: 'Sketched' })
  label: string;

  @ApiProperty({
    example: -40,
    description: 'Percent modifier on the base price',
  })
  modifierPercent: number;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  updatedAt: string;
}

export class UpsertCommissionOptionPricingDto {
  @ApiProperty({ example: 'Sketched' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: -40 })
  @IsInt()
  modifierPercent: number;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CommissionAddonPricingDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  artistId: string;

  @ApiProperty({
    example: 'BACKGROUND',
    description:
      'Internal slug, derived from label at creation and never shown to the artist',
  })
  key: string;

  @ApiProperty({ example: 'Background' })
  label: string;

  @ApiProperty({ enum: PriceMode })
  priceMode: PriceMode;

  @ApiProperty({
    example: 3000,
    description:
      'FIXED: the price. STARTING_FROM: the floor ("from X"). RANGE: the lower bound. In the artist\'s currency\'s smallest unit.',
  })
  minPrice: number;

  @ApiProperty({
    nullable: true,
    description: 'Upper bound — set only when priceMode is RANGE',
  })
  maxPrice: number | null;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  updatedAt: string;
}

export class UpsertCommissionAddonPricingDto {
  @ApiProperty({ example: 'Background' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ enum: PriceMode, default: PriceMode.STARTING_FROM })
  @IsEnum(PriceMode)
  priceMode: PriceMode;

  @ApiProperty({ example: 3000 })
  @IsInt()
  @Min(0)
  minPrice: number;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Required (and > minPrice) when priceMode is RANGE',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxPrice?: number | null;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CommissionRushFeeSettingDto {
  @ApiProperty({
    example: 10,
    description: 'Deadlines within this many days trigger the rush fee',
  })
  thresholdDays: number;

  @ApiProperty({
    example: 2500,
    description: "Rush fee, in the artist's currency's smallest unit",
  })
  feeAmount: number;
}

export class UpsertCommissionRushFeeSettingDto {
  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  thresholdDays: number;

  @ApiProperty({ example: 2500 })
  @IsInt()
  @Min(0)
  feeAmount: number;
}

export class CommissionPricingDto {
  @ApiProperty({ type: CommissionOptionPricingDto, isArray: true })
  options: CommissionOptionPricingDto[];

  @ApiProperty({ type: CommissionAddonPricingDto, isArray: true })
  addons: CommissionAddonPricingDto[];

  @ApiProperty({ type: CommissionRushFeeSettingDto, nullable: true })
  rushFee: CommissionRushFeeSettingDto | null;

  @ApiProperty({ example: 'USD' })
  currency: string;
}
