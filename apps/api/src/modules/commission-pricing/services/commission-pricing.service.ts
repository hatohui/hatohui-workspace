import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '@/infra/db';
import type {
  CommissionAddonPricing,
  CommissionOptionPricing,
  CommissionTypePricing,
} from '@prisma/client';
import {
  CommissionAddonPricingDto,
  CommissionOptionPricingDto,
  CommissionPricingDto,
  CommissionRushFeeSettingDto,
  CommissionTypePricingDto,
  UpsertCommissionAddonPricingDto,
  UpsertCommissionOptionPricingDto,
  UpsertCommissionRushFeeSettingDto,
  UpsertCommissionTypePricingDto,
} from '@/modules/commission-pricing/dto/commission-pricing.dto';

@Injectable()
export class CommissionPricingService {
  constructor(private readonly db: Database) {}

  async getActive(): Promise<CommissionPricingDto> {
    const [types, options, addons, rushFee] = await Promise.all([
      this.db.commissionTypePricing.findMany({ where: { active: true } }),
      this.db.commissionOptionPricing.findMany({ where: { active: true } }),
      this.db.commissionAddonPricing.findMany({ where: { active: true } }),
      this.getRushFee(),
    ]);
    return {
      types: types.map(toTypeDto),
      options: options.map(toOptionDto),
      addons: addons.map(toAddonDto),
      rushFee,
    };
  }

  async getRushFee(): Promise<CommissionRushFeeSettingDto> {
    const setting = await this.db.commissionRushFeeSetting.findFirstOrThrow();
    return { thresholdDays: setting.thresholdDays, feeCents: setting.feeCents };
  }

  async updateRushFee(
    dto: UpsertCommissionRushFeeSettingDto,
  ): Promise<CommissionRushFeeSettingDto> {
    await this.db.commissionRushFeeSetting.updateMany({
      data: { thresholdDays: dto.thresholdDays, feeCents: dto.feeCents },
    });
    return this.getRushFee();
  }

  listTypes(): Promise<CommissionTypePricingDto[]> {
    return this.db.commissionTypePricing
      .findMany({ orderBy: { basePriceCents: 'asc' } })
      .then((rows) => rows.map(toTypeDto));
  }

  async createType(
    dto: UpsertCommissionTypePricingDto,
  ): Promise<CommissionTypePricingDto> {
    const row = await this.db.commissionTypePricing.create({
      data: {
        type: dto.type,
        basePriceCents: dto.basePriceCents,
        active: dto.active ?? true,
      },
    });
    return toTypeDto(row);
  }

  async updateType(
    id: string,
    dto: UpsertCommissionTypePricingDto,
  ): Promise<CommissionTypePricingDto> {
    await this.assertExists(this.db.commissionTypePricing, id);
    const row = await this.db.commissionTypePricing.update({
      where: { id },
      data: {
        type: dto.type,
        basePriceCents: dto.basePriceCents,
        active: dto.active ?? true,
      },
    });
    return toTypeDto(row);
  }

  async deleteType(id: string): Promise<void> {
    await this.assertExists(this.db.commissionTypePricing, id);
    await this.db.commissionTypePricing.delete({ where: { id } });
  }

  listOptions(): Promise<CommissionOptionPricingDto[]> {
    return this.db.commissionOptionPricing
      .findMany({ orderBy: { modifierPercent: 'desc' } })
      .then((rows) => rows.map(toOptionDto));
  }

  async createOption(
    dto: UpsertCommissionOptionPricingDto,
  ): Promise<CommissionOptionPricingDto> {
    const row = await this.db.commissionOptionPricing.create({
      data: {
        key: dto.key,
        modifierPercent: dto.modifierPercent,
        active: dto.active ?? true,
      },
    });
    return toOptionDto(row);
  }

  async updateOption(
    id: string,
    dto: UpsertCommissionOptionPricingDto,
  ): Promise<CommissionOptionPricingDto> {
    await this.assertExists(this.db.commissionOptionPricing, id);
    const row = await this.db.commissionOptionPricing.update({
      where: { id },
      data: {
        key: dto.key,
        modifierPercent: dto.modifierPercent,
        active: dto.active ?? true,
      },
    });
    return toOptionDto(row);
  }

  async deleteOption(id: string): Promise<void> {
    await this.assertExists(this.db.commissionOptionPricing, id);
    await this.db.commissionOptionPricing.delete({ where: { id } });
  }

  listAddons(): Promise<CommissionAddonPricingDto[]> {
    return this.db.commissionAddonPricing
      .findMany({ orderBy: { minPriceCents: 'asc' } })
      .then((rows) => rows.map(toAddonDto));
  }

  async createAddon(
    dto: UpsertCommissionAddonPricingDto,
  ): Promise<CommissionAddonPricingDto> {
    const row = await this.db.commissionAddonPricing.create({
      data: {
        key: dto.key,
        minPriceCents: dto.minPriceCents,
        active: dto.active ?? true,
      },
    });
    return toAddonDto(row);
  }

  async updateAddon(
    id: string,
    dto: UpsertCommissionAddonPricingDto,
  ): Promise<CommissionAddonPricingDto> {
    await this.assertExists(this.db.commissionAddonPricing, id);
    const row = await this.db.commissionAddonPricing.update({
      where: { id },
      data: {
        key: dto.key,
        minPriceCents: dto.minPriceCents,
        active: dto.active ?? true,
      },
    });
    return toAddonDto(row);
  }

  async deleteAddon(id: string): Promise<void> {
    await this.assertExists(this.db.commissionAddonPricing, id);
    await this.db.commissionAddonPricing.delete({ where: { id } });
  }

  private async assertExists(
    model: {
      findUnique: (args: { where: { id: string } }) => Promise<unknown>;
    },
    id: string,
  ): Promise<void> {
    const row = await model.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Pricing row ${id} not found`);
    }
  }
}

function toTypeDto(row: CommissionTypePricing): CommissionTypePricingDto {
  return {
    id: row.id,
    type: row.type,
    basePriceCents: row.basePriceCents,
    active: row.active,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toOptionDto(row: CommissionOptionPricing): CommissionOptionPricingDto {
  return {
    id: row.id,
    key: row.key,
    modifierPercent: row.modifierPercent,
    active: row.active,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toAddonDto(row: CommissionAddonPricing): CommissionAddonPricingDto {
  return {
    id: row.id,
    key: row.key,
    minPriceCents: row.minPriceCents,
    active: row.active,
    updatedAt: row.updatedAt.toISOString(),
  };
}
