import { Injectable } from '@nestjs/common';
import type { Prisma, TravelTagKind } from '@prisma/client';
import { Database } from '@/infra/db';
import { TravelTagDto } from '@/modules/travel-tags/dto/travel-tag.dto';
import { TravelBulkResultDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';
import { translatePrismaError } from '@/modules/travel-recommendations/utils/prisma-errors';
import { uniqueNames } from '@/modules/travel-recommendations/utils/unique-names';
import { tagKeyOf } from '@/modules/travel-tags/utils/tag-key';

const ERRORS = {
  conflict: 'A tag with that name already exists',
  notFound: 'Tag not found',
};

const tagSelect = {
  id: true,
  key: true,
  kind: true,
  name: true,
  _count: { select: { recommendations: true } },
} satisfies Prisma.TravelTagSelect;

type TagRow = Prisma.TravelTagGetPayload<{ select: typeof tagSelect }>;

@Injectable()
export class TravelTagsService {
  constructor(private readonly db: Database) {}

  async list(): Promise<TravelTagDto[]> {
    const rows = await this.db.travelTag.findMany({
      orderBy: [{ kind: 'asc' }, { position: 'asc' }],
      select: tagSelect,
    });
    return rows.map((row) => this.toDto(row));
  }

  async bulkCreate(
    kind: TravelTagKind,
    names: string[],
  ): Promise<TravelBulkResultDto> {
    const existing = await this.db.travelTag.findMany({
      select: { key: true, position: true, kind: true },
    });
    const taken = new Set(existing.map((tag) => tag.key));
    let position = Math.max(
      -1,
      ...existing.filter((tag) => tag.kind === kind).map((t) => t.position),
    );

    const fresh = uniqueNames(names)
      .map((name) => ({ name, key: tagKeyOf(name) }))
      .filter(({ key }) => key && !taken.has(key) && taken.add(key));
    await this.db.travelTag.createMany({
      data: fresh.map(({ name, key }) => ({
        key,
        name,
        kind,
        position: (position += 1),
      })),
    });
    return { created: fresh.length, skipped: names.length - fresh.length };
  }

  async rename(id: string, name: string): Promise<TravelTagDto> {
    try {
      const row = await this.db.travelTag.update({
        where: { id },
        data: { name: name.trim() },
        select: tagSelect,
      });
      return this.toDto(row);
    } catch (error) {
      throw translatePrismaError(error, ERRORS);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.db.travelTag.delete({ where: { id } });
    } catch (error) {
      throw translatePrismaError(error, ERRORS);
    }
  }

  private toDto(row: TagRow): TravelTagDto {
    return {
      id: row.id,
      key: row.key,
      kind: row.kind,
      name: row.name,
      usageCount: row._count.recommendations,
    };
  }
}
