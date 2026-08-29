import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '@/infra/db';
import type { CommissionType, Tag } from '@prisma/client';
import { uniqueSlug } from '@/common/utils/slugify';
import {
  DEFAULT_OPTION_KEY,
  DEFAULT_OPTION_LABEL,
} from '@/modules/commission-types/commission-types.constants';
import {
  ArtistCommissionTypeDto,
  CommissionTypeDto,
  UpsertArtistCommissionTypeDto,
  UpsertCommissionTypeDto,
} from '@/modules/commission-types/dto/commission-type.dto';

type CommissionTypeWithTag = CommissionType & { tag: Tag | null };

@Injectable()
export class CommissionTypesService {
  constructor(private readonly db: Database) {}

  /** The full platform catalog (admin view). */
  listCatalog(activeOnly: boolean): Promise<CommissionTypeDto[]> {
    return this.db.commissionType
      .findMany({
        where: activeOnly ? { active: true } : {},
        include: { tag: true },
        orderBy: { no: 'asc' },
      })
      .then((rows) => rows.map(toDto));
  }

  /** The catalog joined with one artist's enablement of each entry, plus a
   * per-type option count and starting price for the settings cards. */
  async listForArtist(artistId: string): Promise<ArtistCommissionTypeDto[]> {
    const [types, enablements, options] = await Promise.all([
      this.db.commissionType.findMany({
        where: { active: true },
        orderBy: { no: 'asc' },
      }),
      this.db.artistCommissionType.findMany({ where: { artistId } }),
      this.db.commissionOption.findMany({
        where: { artistId, active: true },
        select: { commissionTypeId: true, minPrice: true },
      }),
    ]);
    const enablementByType = new Map(
      enablements.map((row) => [row.commissionTypeId, row]),
    );
    const optionsByType = new Map<
      string,
      { count: number; startingPrice: number | null }
    >();
    for (const option of options) {
      const agg = optionsByType.get(option.commissionTypeId) ?? {
        count: 0,
        startingPrice: null,
      };
      agg.count += 1;
      if (option.minPrice > 0) {
        agg.startingPrice =
          agg.startingPrice == null
            ? option.minPrice
            : Math.min(agg.startingPrice, option.minPrice);
      }
      optionsByType.set(option.commissionTypeId, agg);
    }
    return types.map((type) => {
      const enablement = enablementByType.get(type.id);
      const agg = optionsByType.get(type.id);
      return {
        id: enablement?.id ?? null,
        commissionTypeId: type.id,
        key: type.key,
        label: type.label,
        no: enablement?.no ?? type.no,
        enabled: enablement?.active ?? false,
        optionCount: agg?.count ?? 0,
        startingPrice: agg?.startingPrice ?? null,
      };
    });
  }

  /** Public storefront view: only the types this artist has turned on *and*
   * priced (a type whose sole option is still the unpriced default is not
   * offered), no enablement bookkeeping exposed. */
  async listEnabledForArtist(artistId: string): Promise<CommissionTypeDto[]> {
    const rows = await this.listForArtist(artistId);
    const ids = rows
      .filter((row) => row.enabled && row.startingPrice != null)
      .map((row) => row.commissionTypeId);
    if (ids.length === 0) return [];
    return this.db.commissionType
      .findMany({
        where: { id: { in: ids } },
        include: { tag: true },
        orderBy: { no: 'asc' },
      })
      .then((rows) => rows.map(toDto));
  }

  async setEnabled(
    artistId: string,
    commissionTypeId: string,
    dto: UpsertArtistCommissionTypeDto,
  ): Promise<ArtistCommissionTypeDto> {
    const type = await this.db.commissionType.findUnique({
      where: { id: commissionTypeId },
    });
    if (!type) {
      throw new NotFoundException(
        `Commission type ${commissionTypeId} not found`,
      );
    }
    const row = await this.db.artistCommissionType.upsert({
      where: { artistId_commissionTypeId: { artistId, commissionTypeId } },
      update: { active: dto.active, no: dto.no },
      create: {
        artistId,
        commissionTypeId,
        active: dto.active,
        no: dto.no ?? type.no,
      },
    });

    let optionCount = await this.db.commissionOption.count({
      where: { artistId, commissionTypeId },
    });
    if (dto.active && optionCount === 0) {
      await this.db.commissionOption.create({
        data: {
          artistId,
          commissionTypeId,
          key: DEFAULT_OPTION_KEY,
          label: DEFAULT_OPTION_LABEL,
          priceMode: 'FIXED',
          minPrice: 0,
          no: 0,
          active: true,
        },
      });
      optionCount = 1;
    }

    const startingPrice = await this.db.commissionOption
      .aggregate({
        where: {
          artistId,
          commissionTypeId,
          active: true,
          minPrice: { gt: 0 },
        },
        _min: { minPrice: true },
      })
      .then((agg) => agg._min.minPrice);

    return {
      id: row.id,
      commissionTypeId: type.id,
      key: type.key,
      label: type.label,
      no: row.no,
      enabled: row.active,
      optionCount,
      startingPrice,
    };
  }

  async create(dto: UpsertCommissionTypeDto): Promise<CommissionTypeDto> {
    const key = await uniqueSlug(dto.label, async (candidate) => {
      const existing = await this.db.commissionType.findUnique({
        where: { key: candidate },
      });
      return existing !== null;
    });

    const row = await this.db.$transaction(async (tx) => {
      const tag = await tx.tag.upsert({
        where: { name: dto.label.toLowerCase() },
        update: {},
        create: { name: dto.label.toLowerCase() },
      });
      return tx.commissionType.create({
        data: {
          key,
          label: dto.label,
          no: dto.no ?? 0,
          active: dto.active ?? true,
          tagId: tag.id,
        },
        include: { tag: true },
      });
    });
    return toDto(row);
  }

  async update(
    id: string,
    dto: UpsertCommissionTypeDto,
  ): Promise<CommissionTypeDto> {
    const existing = await this.assertExists(id);
    const row = await this.db.$transaction(async (tx) => {
      let tagId = existing.tagId;
      if (dto.label !== existing.label) {
        const tag = await tx.tag.upsert({
          where: { name: dto.label.toLowerCase() },
          update: {},
          create: { name: dto.label.toLowerCase() },
        });
        tagId = tag.id;
      }
      return tx.commissionType.update({
        where: { id },
        data: {
          label: dto.label,
          no: dto.no ?? existing.no,
          active: dto.active ?? existing.active,
          tagId,
        },
        include: { tag: true },
      });
    });
    return toDto(row);
  }

  async remove(id: string): Promise<void> {
    await this.assertExists(id);
    await this.db.commissionType.delete({ where: { id } });
  }

  private async assertExists(id: string): Promise<CommissionType> {
    const row = await this.db.commissionType.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Commission type ${id} not found`);
    }
    return row;
  }
}

function toDto(row: CommissionTypeWithTag): CommissionTypeDto {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    no: row.no,
    active: row.active,
    tagId: row.tagId,
    tagName: row.tag?.name ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
