import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { PriceMode } from '@prisma/client';
import { SUPPORTED_CURRENCIES } from '@/modules/commission-pricing/commission-pricing.constants';

export { PriceMode };

/** priceMode values valid for a CommissionOption — an option has nothing to
 * take a PERCENTAGE of, since it's the thing other prices are a percentage of. */
export const OPTION_PRICE_MODES = [
  PriceMode.FIXED,
  PriceMode.STARTING_FROM,
  PriceMode.RANGE,
] as const;

export class CommissionOptionPricingDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  artistId: string;

  @ApiProperty()
  commissionTypeId: string;

  @ApiProperty({
    example: 'SKETCHED',
    description:
      'Internal slug, derived from label at creation and never shown to the artist',
  })
  key: string;

  @ApiProperty({ example: 'Sketched' })
  label: string;

  @ApiProperty({ enum: OPTION_PRICE_MODES })
  priceMode: (typeof OPTION_PRICE_MODES)[number];

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

  @ApiProperty({ description: 'Display order, ascending' })
  no: number;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  updatedAt: string;
}

export class UpsertCommissionOptionPricingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  commissionTypeId: string;

  @ApiProperty({ example: 'Sketched' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ enum: OPTION_PRICE_MODES, default: PriceMode.FIXED })
  @IsEnum(OPTION_PRICE_MODES)
  priceMode: (typeof OPTION_PRICE_MODES)[number];

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
    nullable: true,
    description:
      'FIXED: the price. STARTING_FROM: the floor ("from X"). RANGE: the lower bound. Unused for PERCENTAGE. In the currency\'s smallest unit.',
  })
  minPrice: number | null;

  @ApiProperty({
    nullable: true,
    description: 'Upper bound — set only when priceMode is RANGE',
  })
  maxPrice: number | null;

  @ApiProperty({
    nullable: true,
    description:
      "Percent of the selected CommissionOption's price — set only when priceMode is PERCENTAGE",
  })
  percent: number | null;

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

  @ApiProperty({
    required: false,
    description: 'Required unless priceMode is PERCENTAGE',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Required (and > minPrice) when priceMode is RANGE',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxPrice?: number | null;

  @ApiProperty({
    required: false,
    description:
      "Required when priceMode is PERCENTAGE — percent of the selected option's price",
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  percent?: number;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CommissionRushFeeSettingDto {
  @ApiProperty({ description: 'Whether the rush fee applies at all' })
  enabled: boolean;

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
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  thresholdDays: number;

  @ApiProperty({ example: 2500 })
  @IsInt()
  @Min(0)
  feeAmount: number;
}

export class PaymentMethodEntryDto {
  @ApiProperty({ example: 'PayPal' })
  name: string;

  @ApiProperty({
    nullable: true,
    example: 'paypal.me/myhandle',
    description: 'How the client actually pays — handle, link, or account note',
  })
  instructions: string | null;
}

export class UpsertPaymentMethodEntryDto {
  @ApiProperty({ example: 'PayPal' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name: string;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'paypal.me/myhandle',
  })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  instructions?: string | null;
}

export class CommissionSettingsDto {
  @ApiProperty({ enum: SUPPORTED_CURRENCIES, example: 'USD' })
  currency: string;

  @ApiProperty({
    description: 'Skip manual triage — accept submissions automatically',
  })
  autoAccept: boolean;

  @ApiProperty({
    nullable: true,
    description:
      'Where commission notifications go; falls back to the account email when unset',
  })
  notificationEmail: string | null;

  @ApiProperty({ type: PaymentMethodEntryDto, isArray: true })
  paymentMethods: PaymentMethodEntryDto[];
}

export class UpsertCommissionSettingsDto {
  @ApiProperty({ enum: SUPPORTED_CURRENCIES, example: 'USD' })
  @IsIn(SUPPORTED_CURRENCIES)
  currency: string;

  @ApiProperty()
  @IsBoolean()
  autoAccept: boolean;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsEmail()
  notificationEmail?: string | null;

  @ApiProperty({ type: UpsertPaymentMethodEntryDto, isArray: true })
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => UpsertPaymentMethodEntryDto)
  paymentMethods: UpsertPaymentMethodEntryDto[];
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
