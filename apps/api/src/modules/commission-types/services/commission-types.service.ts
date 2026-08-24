import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '@/infra/db';
import type { CommissionType, Tag } from '@prisma/client';
import {
  CommissionTypeDto,
  UpsertCommissionTypeDto,
} from '@/modules/commission-types/dto/commission-type.dto';

type CommissionTypeWithTag = CommissionType & { tag: Tag };

@Injectable()
export class CommissionTypesService {
  constructor(private readonly db: Database) {}

  list(activeOnly: boolean): Promise<CommissionTypeDto[]> {
    return this.db.commissionType
      .findMany({
        where: activeOnly ? { active: true } : undefined,
        include: { tag: true },
        orderBy: { no: 'asc' },
      })
      .then((rows) => rows.map(toDto));
  }

  async create(dto: UpsertCommissionTypeDto): Promise<CommissionTypeDto> {
    const row = await this.db.$transaction(async (tx) => {
      const tag = await tx.tag.create({
        data: { name: dto.key.toLowerCase() },
      });
      return tx.commissionType.create({
        data: {
          key: dto.key,
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
      if (dto.key !== existing.key) {
        await tx.tag.update({
          where: { id: existing.tagId },
          data: { name: dto.key.toLowerCase() },
        });
      }
      return tx.commissionType.update({
        where: { id },
        data: {
          key: dto.key,
          no: dto.no ?? existing.no,
          active: dto.active ?? existing.active,
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
    no: row.no,
    active: row.active,
    tagId: row.tagId,
    tagName: row.tag.name,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
