import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '@/infra/db';
import type { CommissionType, Tag } from '@prisma/client';
import { uniqueSlug } from '@/common/utils/slugify';
import {
  CommissionTypeDto,
  UpsertCommissionTypeDto,
} from '@/modules/commission-types/dto/commission-type.dto';

type CommissionTypeWithTag = CommissionType & { tag: Tag | null };

@Injectable()
export class CommissionTypesService {
  constructor(private readonly db: Database) {}

  list(artistId: string, activeOnly: boolean): Promise<CommissionTypeDto[]> {
    return this.db.commissionType
      .findMany({
        where: activeOnly ? { artistId, active: true } : { artistId },
        include: { tag: true },
        orderBy: { no: 'asc' },
      })
      .then((rows) => rows.map(toDto));
  }

  async create(
    artistId: string,
    dto: UpsertCommissionTypeDto,
  ): Promise<CommissionTypeDto> {
    const key = await uniqueSlug(dto.label, async (candidate) => {
      const existing = await this.db.commissionType.findUnique({
        where: { artistId_key: { artistId, key: candidate } },
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
          artistId,
          key,
          label: dto.label,
          basePrice: dto.basePrice,
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
    artistId: string,
    id: string,
    dto: UpsertCommissionTypeDto,
  ): Promise<CommissionTypeDto> {
    const existing = await this.assertOwned(artistId, id);
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
          basePrice: dto.basePrice,
          no: dto.no ?? existing.no,
          active: dto.active ?? existing.active,
          tagId,
        },
        include: { tag: true },
      });
    });
    return toDto(row);
  }

  async remove(artistId: string, id: string): Promise<void> {
    await this.assertOwned(artistId, id);
    await this.db.commissionType.delete({ where: { id } });
  }

  private async assertOwned(
    artistId: string,
    id: string,
  ): Promise<CommissionType> {
    const row = await this.db.commissionType.findUnique({ where: { id } });
    if (!row || row.artistId !== artistId) {
      throw new NotFoundException(`Commission type ${id} not found`);
    }
    return row;
  }
}

function toDto(row: CommissionTypeWithTag): CommissionTypeDto {
  return {
    id: row.id,
    artistId: row.artistId,
    key: row.key,
    label: row.label,
    basePrice: row.basePrice,
    no: row.no,
    active: row.active,
    tagId: row.tagId,
    tagName: row.tag?.name ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
