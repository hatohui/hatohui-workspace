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
import { CommissionType } from '@prisma/client';

export { CommissionType };

export class CommissionTypePricingDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    enum: CommissionType,
    description: 'Also the i18n key: commission.type.<type>',
  })
  type: CommissionType;

  @ApiProperty({ example: 3000, description: 'Base price in USD cents' })
  basePriceCents: number;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  updatedAt: string;
}

export class UpsertCommissionTypePricingDto {
  @ApiProperty({ enum: CommissionType })
  @IsEnum(CommissionType)
  type: CommissionType;

  @ApiProperty({ example: 3000 })
  @IsInt()
  @Min(0)
  basePriceCents: number;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CommissionOptionPricingDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    example: 'SKETCHED',
    description: 'Also the i18n key: commission.option.<key>',
  })
  key: string;

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
  @ApiProperty({ example: 'SKETCHED' })
  @IsString()
  @IsNotEmpty()
  key: string;

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

  @ApiProperty({
    example: 'BACKGROUND',
    description: 'Also the i18n key: commission.addon.<key>',
  })
  key: string;

  @ApiProperty({
    example: 3000,
    description: 'Minimum price in USD cents ("from $X")',
  })
  minPriceCents: number;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  updatedAt: string;
}

export class UpsertCommissionAddonPricingDto {
  @ApiProperty({ example: 'BACKGROUND' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 3000 })
  @IsInt()
  @Min(0)
  minPriceCents: number;

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

  @ApiProperty({ example: 2500, description: 'Rush fee in USD cents' })
  feeCents: number;
}

export class UpsertCommissionRushFeeSettingDto {
  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  thresholdDays: number;

  @ApiProperty({ example: 2500 })
  @IsInt()
  @Min(0)
  feeCents: number;
}

export class CommissionPricingDto {
  @ApiProperty({ type: CommissionTypePricingDto, isArray: true })
  types: CommissionTypePricingDto[];

  @ApiProperty({ type: CommissionOptionPricingDto, isArray: true })
  options: CommissionOptionPricingDto[];

  @ApiProperty({ type: CommissionAddonPricingDto, isArray: true })
  addons: CommissionAddonPricingDto[];

  @ApiProperty({ type: CommissionRushFeeSettingDto })
  rushFee: CommissionRushFeeSettingDto;
}
