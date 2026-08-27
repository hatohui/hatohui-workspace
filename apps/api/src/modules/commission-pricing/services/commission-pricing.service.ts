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

  listOptions(
    artistId: string,
    commissionTypeId?: string,
  ): Promise<CommissionOptionPricingDto[]> {
    return this.db.commissionOption
      .findMany({
        where: { artistId, ...(commissionTypeId ? { commissionTypeId } : {}) },
        orderBy: { no: 'asc' },
      })
      .then((rows) => rows.map(toOptionDto));
  }

  async createOption(
    artistId: string,
    dto: UpsertCommissionOptionPricingDto,
  ): Promise<CommissionOptionPricingDto> {
    await this.assertTypeExists(dto.commissionTypeId);
    const maxPrice = normalizeOptionMaxPrice(dto);
    const key = await uniqueSlug(dto.label, async (candidate) => {
      const existing = await this.db.commissionOption.findUnique({
        where: {
          artistId_commissionTypeId_key: {
            artistId,
            commissionTypeId: dto.commissionTypeId,
            key: candidate,
          },
        },
      });
      return existing !== null;
    });
    const row = await this.db.commissionOption.create({
      data: {
        artistId,
        commissionTypeId: dto.commissionTypeId,
        key,
        label: dto.label,
        priceMode: dto.priceMode,
        minPrice: dto.minPrice,
        maxPrice,
        no: dto.no ?? 0,
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
    const maxPrice = normalizeOptionMaxPrice(dto);
    const row = await this.db.commissionOption.update({
      where: { id },
      data: {
        label: dto.label,
        priceMode: dto.priceMode,
        minPrice: dto.minPrice,
        maxPrice,
        no: dto.no,
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
    const { minPrice, maxPrice, percent } = normalizeAddonPricing(dto);
    const key = await uniqueSlug(dto.label, async (candidate) => {
      const existing = await this.db.commissionAddon.findUnique({
        where: { artistId_key: { artistId, key: candidate } },
      });
      return existing !== null;
    });
    const row = await this.db.commissionAddon.create({
      data: {
        artistId,
        key,
        label: dto.label,
        priceMode: dto.priceMode,
        minPrice,
        maxPrice,
        percent,
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
    const { minPrice, maxPrice, percent } = normalizeAddonPricing(dto);
    const row = await this.db.commissionAddon.update({
      where: { id },
      data: {
        label: dto.label,
        priceMode: dto.priceMode,
        minPrice,
        maxPrice,
        percent,
        active: dto.active ?? true,
      },
    });
    return toAddonDto(row);
  }

  async deleteAddon(artistId: string, id: string): Promise<void> {
    await this.assertOwned(this.db.commissionAddon, artistId, id);
    await this.db.commissionAddon.delete({ where: { id } });
  }

  private async assertTypeExists(commissionTypeId: string): Promise<void> {
    const type = await this.db.commissionType.findUnique({
      where: { id: commissionTypeId },
    });
    if (!type) {
      throw new NotFoundException(
        `Commission type ${commissionTypeId} not found`,
      );
    }
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
    commissionTypeId: row.commissionTypeId,
    key: row.key,
    label: row.label,
    priceMode: row.priceMode as CommissionOptionPricingDto['priceMode'],
    minPrice: row.minPrice,
    maxPrice: row.maxPrice,
    no: row.no,
    active: row.active,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function normalizeOptionMaxPrice(dto: {
  priceMode: string;
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

function normalizeAddonPricing(dto: {
  priceMode: PriceMode;
  minPrice?: number;
  maxPrice?: number | null;
  percent?: number;
}): {
  minPrice: number | null;
  maxPrice: number | null;
  percent: number | null;
} {
  if (dto.priceMode === PriceMode.PERCENTAGE) {
    if (dto.percent == null) {
      throw new BadRequestException(
        'percent is required when priceMode is PERCENTAGE',
      );
    }
    return { minPrice: null, maxPrice: null, percent: dto.percent };
  }

  if (dto.minPrice == null) {
    throw new BadRequestException(
      'minPrice is required unless priceMode is PERCENTAGE',
    );
  }
  if (dto.priceMode === PriceMode.RANGE) {
    if (dto.maxPrice == null || dto.maxPrice <= dto.minPrice) {
      throw new BadRequestException(
        'maxPrice is required and must be greater than minPrice when priceMode is RANGE',
      );
    }
    return { minPrice: dto.minPrice, maxPrice: dto.maxPrice, percent: null };
  }

  return { minPrice: dto.minPrice, maxPrice: null, percent: null };
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
    percent: row.percent,
    active: row.active,
    updatedAt: row.updatedAt.toISOString(),
  };
}
