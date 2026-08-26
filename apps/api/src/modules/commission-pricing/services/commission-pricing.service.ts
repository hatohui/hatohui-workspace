import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Database } from '@/infra/db';
import {
  PriceMode,
  type CommissionAddon,
  type CommissionOption,
} from '@prisma/client';
import { uniqueSlug } from '@/common/utils/slugify';
import { USER_SETTING_TYPES } from '@/modules/user-settings/user-settings.constants';
import { UserSettingsService } from '@/modules/user-settings/services/user-settings.service';
import {
  CommissionAddonPricingDto,
  CommissionOptionPricingDto,
  CommissionPricingDto,
  CommissionRushFeeSettingDto,
  UpsertCommissionAddonPricingDto,
  UpsertCommissionOptionPricingDto,
  UpsertCommissionRushFeeSettingDto,
} from '@/modules/commission-pricing/dto/commission-pricing.dto';

const DEFAULT_CURRENCY = 'USD';

@Injectable()
export class CommissionPricingService {
  constructor(
    private readonly db: Database,
    private readonly userSettings: UserSettingsService,
  ) {}

  async getActive(artistId: string): Promise<CommissionPricingDto> {
    const [options, addons, rushFee, currency] = await Promise.all([
      this.db.commissionOption.findMany({
        where: { artistId, active: true },
      }),
      this.db.commissionAddon.findMany({ where: { artistId, active: true } }),
      this.getRushFee(artistId),
      this.getCurrency(artistId),
    ]);
    return {
      options: options.map(toOptionDto),
      addons: addons.map(toAddonDto),
      rushFee,
      currency,
    };
  }

  async getCurrency(artistId: string): Promise<string> {
    const setting = USER_SETTING_TYPES.commissionCurrency;
    const value = await this.userSettings.get(
      artistId,
      setting.scope,
      setting.type,
    );
    return value ?? DEFAULT_CURRENCY;
  }

  async getRushFee(
    artistId: string,
  ): Promise<CommissionRushFeeSettingDto | null> {
    const setting = USER_SETTING_TYPES.commissionRushFee;
    const value = await this.userSettings.get(
      artistId,
      setting.scope,
      setting.type,
    );
    if (!value) return null;
    return JSON.parse(value) as CommissionRushFeeSettingDto;
  }

  async updateRushFee(
    artistId: string,
    dto: UpsertCommissionRushFeeSettingDto,
  ): Promise<CommissionRushFeeSettingDto> {
    const setting = USER_SETTING_TYPES.commissionRushFee;
    await this.userSettings.set(
      artistId,
      setting.scope,
      setting.type,
      JSON.stringify(dto),
    );
    return dto;
  }

  listOptions(artistId: string): Promise<CommissionOptionPricingDto[]> {
    return this.db.commissionOption
      .findMany({ where: { artistId }, orderBy: { no: 'asc' } })
      .then((rows) => rows.map(toOptionDto));
  }

  async createOption(
    artistId: string,
    dto: UpsertCommissionOptionPricingDto,
  ): Promise<CommissionOptionPricingDto> {
    const row = await this.db.commissionOption.create({
      data: {
        artistId,
        key: dto.key,
        label: dto.label,
        modifierPercent: dto.modifierPercent,
        active: dto.active ?? true,
      },
    });
    return toOptionDto(row);
  }

  async updateOption(
    artistId: string,
    id: string,
    dto: UpsertCommissionOptionPricingDto,
  ): Promise<CommissionOptionPricingDto> {
    await this.assertOwned(this.db.commissionOption, artistId, id);
    const row = await this.db.commissionOption.update({
      where: { id },
      data: {
        key: dto.key,
        label: dto.label,
        modifierPercent: dto.modifierPercent,
        active: dto.active ?? true,
      },
    });
    return toOptionDto(row);
  }

  async deleteOption(artistId: string, id: string): Promise<void> {
    await this.assertOwned(this.db.commissionOption, artistId, id);
    await this.db.commissionOption.delete({ where: { id } });
  }

  listAddons(artistId: string): Promise<CommissionAddonPricingDto[]> {
    return this.db.commissionAddon
      .findMany({ where: { artistId }, orderBy: { no: 'asc' } })
      .then((rows) => rows.map(toAddonDto));
  }

  async createAddon(
    artistId: string,
    dto: UpsertCommissionAddonPricingDto,
  ): Promise<CommissionAddonPricingDto> {
    const maxPrice = normalizeAddonMaxPrice(dto);
    const row = await this.db.commissionAddon.create({
      data: {
        artistId,
        key: dto.key,
        label: dto.label,
        priceMode: dto.priceMode,
        minPrice: dto.minPrice,
        maxPrice,
        active: dto.active ?? true,
      },
    });
    return toAddonDto(row);
  }

  async updateAddon(
    artistId: string,
    id: string,
    dto: UpsertCommissionAddonPricingDto,
  ): Promise<CommissionAddonPricingDto> {
    await this.assertOwned(this.db.commissionAddon, artistId, id);
    const maxPrice = normalizeAddonMaxPrice(dto);
    const row = await this.db.commissionAddon.update({
      where: { id },
      data: {
        key: dto.key,
        label: dto.label,
        priceMode: dto.priceMode,
        minPrice: dto.minPrice,
        maxPrice,
        active: dto.active ?? true,
      },
    });
    return toAddonDto(row);
  }

  async deleteAddon(artistId: string, id: string): Promise<void> {
    await this.assertOwned(this.db.commissionAddon, artistId, id);
    await this.db.commissionAddon.delete({ where: { id } });
  }

  private async assertOwned(
    model: {
      findUnique: (args: {
        where: { id: string };
      }) => Promise<{ artistId: string } | null>;
    },
    artistId: string,
    id: string,
  ): Promise<void> {
    const row = await model.findUnique({ where: { id } });
    if (!row || row.artistId !== artistId) {
      throw new NotFoundException(`Pricing row ${id} not found`);
    }
  }
}

function toOptionDto(row: CommissionOption): CommissionOptionPricingDto {
  return {
    id: row.id,
    artistId: row.artistId,
    key: row.key,
    label: row.label,
    modifierPercent: row.modifierPercent,
    active: row.active,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function normalizeAddonMaxPrice(dto: {
  priceMode: PriceMode;
  minPrice: number;
  maxPrice?: number | null;
}): number | null {
  if (dto.priceMode !== PriceMode.RANGE) return null;
  if (dto.maxPrice == null || dto.maxPrice <= dto.minPrice) {
    throw new BadRequestException(
      'maxPrice is required and must be greater than minPrice when priceMode is RANGE',
    );
  }
  return dto.maxPrice;
}

function toAddonDto(row: CommissionAddon): CommissionAddonPricingDto {
  return {
    id: row.id,
    artistId: row.artistId,
    key: row.key,
    label: row.label,
    priceMode: row.priceMode,
    minPrice: row.minPrice,
    maxPrice: row.maxPrice,
    active: row.active,
    updatedAt: row.updatedAt.toISOString(),
  };
}
