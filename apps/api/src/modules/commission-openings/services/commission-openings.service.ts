import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Database } from '@/infra/db';
import {
  CommissionOpening,
  CommissionOpeningEndMode,
  CommissionOpeningStatus,
  CommissionStatus,
} from '@prisma/client';
import {
  CommissionOpeningDto,
  UpsertCommissionOpeningDto,
} from '@/modules/commission-openings/dto/commission-opening.dto';

/// A commission counts against a slot cap once it's past triage — pending
/// submissions haven't taken a slot yet, and declined/cancelled ones gave
/// theirs back.
const SLOT_TAKEN_STATUSES: CommissionStatus[] = [
  CommissionStatus.ACCEPTED,
  CommissionStatus.NOT_YET_STARTED,
  CommissionStatus.QUEUED,
  CommissionStatus.SKETCH,
  CommissionStatus.CONFIRMED,
  CommissionStatus.ONGOING,
  CommissionStatus.COMPLETED,
];

const ACTIVE_STATUSES: CommissionOpeningStatus[] = [
  CommissionOpeningStatus.SCHEDULED,
  CommissionOpeningStatus.OPEN,
];

@Injectable()
export class CommissionOpeningsService {
  constructor(private readonly db: Database) {}

  /** The opening a storefront should show for an artist: the open one, else the
   * next scheduled one, else the most recently closed one so the page can say
   * when requests were last accepted. Null only if the artist has never opened. */
  async getCurrent(artistId: string): Promise<CommissionOpeningDto | null> {
    const opening =
      (await this.db.commissionOpening.findFirst({
        where: { artistId, status: CommissionOpeningStatus.OPEN },
      })) ??
      (await this.db.commissionOpening.findFirst({
        where: { artistId, status: CommissionOpeningStatus.SCHEDULED },
        orderBy: { scheduledAt: 'asc' },
      })) ??
      (await this.db.commissionOpening.findFirst({
        where: { artistId, status: CommissionOpeningStatus.CLOSED },
        orderBy: { closedAt: 'desc' },
      }));
    if (!opening) return null;
    return this.toDto(opening);
  }

  async listMine(artistId: string): Promise<CommissionOpeningDto[]> {
    const rows = await this.db.commissionOpening.findMany({
      where: { artistId },
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(rows.map((row) => this.toDto(row)));
  }

  async create(
    artistId: string,
    dto: UpsertCommissionOpeningDto,
  ): Promise<CommissionOpeningDto> {
    await this.assertNoActiveOpening(artistId);
    this.validateEndMode(dto);

    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    const opensNow = !scheduledAt || scheduledAt.getTime() <= Date.now();

    const row = await this.db.commissionOpening.create({
      data: {
        artistId,
        endMode: dto.endMode,
        status: opensNow
          ? CommissionOpeningStatus.OPEN
          : CommissionOpeningStatus.SCHEDULED,
        scheduledAt,
        openedAt: opensNow ? new Date() : null,
        slotCap: dto.slotCap ?? null,
        slotCapEndsAt: dto.slotCapEndsAt ? new Date(dto.slotCapEndsAt) : null,
        postTitle: dto.postTitle ?? null,
        postBody: dto.postBody ?? undefined,
      },
    });
    return this.toDto(row);
  }

  async update(
    artistId: string,
    id: string,
    dto: UpsertCommissionOpeningDto,
  ): Promise<CommissionOpeningDto> {
    const existing = await this.assertOwned(artistId, id);
    if (existing.status === CommissionOpeningStatus.CLOSED) {
      throw new BadRequestException('A closed opening cannot be edited');
    }
    this.validateEndMode(dto);

    const row = await this.db.commissionOpening.update({
      where: { id },
      data: {
        endMode: dto.endMode,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        slotCap: dto.slotCap ?? null,
        slotCapEndsAt: dto.slotCapEndsAt ? new Date(dto.slotCapEndsAt) : null,
        postTitle: dto.postTitle ?? null,
        postBody: dto.postBody ?? undefined,
      },
    });
    return this.toDto(row);
  }

  async open(artistId: string, id: string): Promise<CommissionOpeningDto> {
    const existing = await this.assertOwned(artistId, id);
    if (existing.status !== CommissionOpeningStatus.SCHEDULED) {
      throw new BadRequestException('Only a scheduled opening can be opened');
    }
    const row = await this.db.commissionOpening.update({
      where: { id },
      data: { status: CommissionOpeningStatus.OPEN, openedAt: new Date() },
    });
    return this.toDto(row);
  }

  async close(artistId: string, id: string): Promise<CommissionOpeningDto> {
    const existing = await this.assertOwned(artistId, id);
    if (existing.status !== CommissionOpeningStatus.OPEN) {
      throw new BadRequestException('Only an open opening can be closed');
    }
    const row = await this.db.commissionOpening.update({
      where: { id },
      data: { status: CommissionOpeningStatus.CLOSED, closedAt: new Date() },
    });
    return this.toDto(row);
  }

  async remove(artistId: string, id: string): Promise<void> {
    await this.assertOwned(artistId, id);
    const hasCommissions = await this.db.commission.findFirst({
      where: { commissionOpeningId: id },
      select: { id: true },
    });
    if (hasCommissions) {
      throw new BadRequestException(
        'Cannot delete an opening that already has commissions attached',
      );
    }
    await this.db.commissionOpening.delete({ where: { id } });
  }

  /// Called by CommissionsService after a status transition — auto-closes a
  /// SLOT_CAP opening once enough slots are taken. Silently does nothing for
  /// any other shape of opening, since most calls here are a no-op.
  async maybeAutoCloseForSlotCap(commissionOpeningId: string): Promise<void> {
    const opening = await this.db.commissionOpening.findUnique({
      where: { id: commissionOpeningId },
    });
    if (
      !opening ||
      opening.status !== CommissionOpeningStatus.OPEN ||
      opening.endMode !== CommissionOpeningEndMode.SLOT_CAP ||
      !opening.slotCap
    ) {
      return;
    }

    const slotsTaken = await this.db.commission.count({
      where: {
        commissionOpeningId,
        status: { in: SLOT_TAKEN_STATUSES },
      },
    });
    if (slotsTaken >= opening.slotCap) {
      await this.db.commissionOpening.update({
        where: { id: commissionOpeningId },
        data: {
          status: CommissionOpeningStatus.CLOSED,
          closedAt: new Date(),
        },
      });
    }
  }

  private validateEndMode(dto: UpsertCommissionOpeningDto): void {
    if (dto.endMode === CommissionOpeningEndMode.SLOT_CAP && !dto.slotCap) {
      throw new BadRequestException(
        'slotCap is required when endMode is SLOT_CAP',
      );
    }
  }

  private async assertNoActiveOpening(artistId: string): Promise<void> {
    const existing = await this.db.commissionOpening.findFirst({
      where: { artistId, status: { in: ACTIVE_STATUSES } },
    });
    if (existing) {
      throw new ConflictException(
        'You already have an active (open or scheduled) commission opening',
      );
    }
  }

  private async assertOwned(
    artistId: string,
    id: string,
  ): Promise<CommissionOpening> {
    const row = await this.db.commissionOpening.findUnique({ where: { id } });
    if (!row || row.artistId !== artistId) {
      throw new NotFoundException(`Commission opening ${id} not found`);
    }
    return row;
  }

  private async toDto(row: CommissionOpening): Promise<CommissionOpeningDto> {
    const slotsTaken = await this.db.commission.count({
      where: {
        commissionOpeningId: row.id,
        status: { in: SLOT_TAKEN_STATUSES },
      },
    });
    return {
      id: row.id,
      artistId: row.artistId,
      status: row.status,
      endMode: row.endMode,
      scheduledAt: row.scheduledAt?.toISOString() ?? null,
      openedAt: row.openedAt?.toISOString() ?? null,
      closedAt: row.closedAt?.toISOString() ?? null,
      slotCap: row.slotCap,
      slotCapEndsAt: row.slotCapEndsAt?.toISOString() ?? null,
      slotsTaken,
      postTitle: row.postTitle,
      postBody: row.postBody as object | null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
