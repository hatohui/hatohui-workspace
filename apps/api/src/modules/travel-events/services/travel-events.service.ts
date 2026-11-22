import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AppScope,
  NotificationType,
  Prisma,
  ProcessType,
  TravelEventVisibility,
  type User,
} from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import {
  STAGING_PREFIX,
  isStagedKey,
  travelEventImageKeyFor,
} from '@/common/utils/asset-paths';
import { resolveMapsLocation } from '@/common/utils/maps-coordinates';
import { ProcessQueueService } from '@/modules/process-queue/services/process-queue.service';
import { StorageCleanupService } from '@/modules/storage-cleanup/services/storage-cleanup.service';
import { TravelAccessService } from '@/modules/travel-access/services/travel-access.service';
import {
  toTravelCreatorDto,
  travelCreatorSelect,
} from '@/modules/travel-recommendations/utils/travel-creator';
import {
  DEFAULT_EVENTS_LIST_LIMIT,
  DEFAULT_UPCOMING_EVENTS_LIMIT,
} from '@/modules/travel-events/travel-events.constants';
import {
  CreateTravelEventDto,
  TravelAdminEventQueryDto,
  TravelEventDto,
  TravelEventQueryDto,
  TravelMyEventParticipationDto,
  UpdateTravelEventDto,
} from '@/modules/travel-events/dto/travel-event.dto';
import { TravelEventThumbnailExecutor } from '@/modules/travel-events/services/travel-event-thumbnail.executor';

const eventInclude = {
  createdBy: { select: travelCreatorSelect },
  invitees: { select: { userId: true } },
} satisfies Prisma.TravelEventInclude;

type EventRow = Prisma.TravelEventGetPayload<{ include: typeof eventInclude }>;

@Injectable()
export class TravelEventsService {
  private readonly logger = new Logger(TravelEventsService.name);

  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly access: TravelAccessService,
    private readonly processQueue: ProcessQueueService,
    private readonly storageCleanup: StorageCleanupService,
    private readonly thumbnailExecutor: TravelEventThumbnailExecutor,
  ) {}

  async list(
    query: TravelEventQueryDto,
    viewerId?: string,
  ): Promise<TravelEventDto[]> {
    const q = query.q?.trim();
    const areaFilter: Prisma.TravelEventWhereInput = query.areaId
      ? { areaId: query.areaId }
      : query.countryId
        ? { area: { countryId: query.countryId } }
        : {};

    const visibilityOr: Prisma.TravelEventWhereInput[] = [
      { isApproved: true, visibility: TravelEventVisibility.PUBLIC },
    ];
    if (viewerId) {
      visibilityOr.push(
        {
          visibility: TravelEventVisibility.PRIVATE,
          OR: [
            { createdById: viewerId },
            { invitees: { some: { userId: viewerId } } },
            { participations: { some: { userId: viewerId } } },
          ],
        },
        { isApproved: false, createdById: viewerId },
      );
    }

    const rows = await this.db.travelEvent.findMany({
      where: {
        isDeleted: false,
        ...areaFilter,
        ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
        ...(query.from ? { endAt: { gte: new Date(query.from) } } : {}),
        ...(query.to ? { startAt: { lte: new Date(query.to) } } : {}),
        OR: visibilityOr,
      },
      include: eventInclude,
      orderBy: { startAt: 'asc' },
      take: query.limit ?? DEFAULT_EVENTS_LIST_LIMIT,
    });

    return rows.map((row) => this.toDto(row));
  }

  async listUpcoming(
    limit = DEFAULT_UPCOMING_EVENTS_LIMIT,
    viewerId?: string,
  ): Promise<TravelEventDto[]> {
    const visibilityOr: Prisma.TravelEventWhereInput[] = [
      { visibility: TravelEventVisibility.PUBLIC },
    ];
    if (viewerId) {
      visibilityOr.push(
        { createdById: viewerId },
        { invitees: { some: { userId: viewerId } } },
      );
    }

    const rows = await this.db.travelEvent.findMany({
      where: {
        isApproved: true,
        isDeleted: false,
        startAt: { gt: new Date() },
        OR: visibilityOr,
      },
      include: eventInclude,
      orderBy: { startAt: 'asc' },
      take: limit,
    });
    return rows.map((row) => this.toDto(row));
  }

  async listCalendar(
    fromIso: string,
    toIso: string,
    viewerId?: string,
  ): Promise<TravelEventDto[]> {
    const visibilityOr: Prisma.TravelEventWhereInput[] = [
      { visibility: TravelEventVisibility.PUBLIC },
    ];
    if (viewerId) {
      visibilityOr.push(
        { createdById: viewerId },
        { invitees: { some: { userId: viewerId } } },
        { participations: { some: { userId: viewerId } } },
      );
    }

    const rows = await this.db.travelEvent.findMany({
      where: {
        isApproved: true,
        isDeleted: false,
        startAt: { lte: new Date(toIso) },
        endAt: { gte: new Date(fromIso) },
        OR: visibilityOr,
      },
      include: eventInclude,
      orderBy: { startAt: 'asc' },
    });
    return rows.map((row) => this.toDto(row));
  }

  async get(id: string, viewer?: User): Promise<TravelEventDto> {
    const row = await this.db.travelEvent.findFirst({
      where: { id, isDeleted: false },
      include: eventInclude,
    });
    if (!row) throw new NotFoundException('Event not found');

    const isEditor = viewer ? await this.access.canEdit(viewer) : false;
    if (!isEditor) {
      const isCreator = viewer?.id === row.createdById;
      const isInvitee = Boolean(
        viewer && row.invitees.some((inv) => inv.userId === viewer.id),
      );
      const isParticipant = viewer
        ? Boolean(
            await this.db.travelParticipation.findFirst({
              where: { eventId: id, userId: viewer.id },
              select: { id: true },
            }),
          )
        : false;

      if (!row.isApproved && !isCreator) {
        throw new NotFoundException('Event not found');
      }
      if (
        row.visibility === TravelEventVisibility.PRIVATE &&
        !isCreator &&
        !isInvitee &&
        !isParticipant
      ) {
        throw new ForbiddenException('Event is private');
      }
    }

    return this.toDto(row);
  }

  async getMyParticipation(
    eventId: string,
    userId: string,
  ): Promise<TravelMyEventParticipationDto> {
    const row = await this.db.travelParticipation.findFirst({
      where: { eventId, userId },
      select: { id: true },
    });
    return { participationId: row?.id ?? null };
  }

  async create(user: User, dto: CreateTravelEventDto): Promise<TravelEventDto> {
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (endAt < startAt) {
      throw new BadRequestException('Event end date must be after start date');
    }

    const visibility = dto.visibility ?? TravelEventVisibility.PUBLIC;
    const isEditor = await this.access.canEdit(user);
    const isApproved = visibility === TravelEventVisibility.PRIVATE || isEditor;

    const mapsUrl = dto.mapsUrl?.trim() || null;
    const coords = mapsUrl ? await resolveMapsLocation(mapsUrl) : null;

    const inviteeIds = Array.from(new Set(dto.inviteeIds ?? []));

    const created = await this.db.travelEvent.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        isYearly: dto.isYearly ?? false,
        visibility,
        isApproved,
        startAt,
        endAt,
        location: dto.location?.trim() || null,
        mapsUrl,
        latitude: coords?.coordinates?.latitude ?? null,
        longitude: coords?.coordinates?.longitude ?? null,
        areaId: dto.areaId || null,
        placeId: dto.placeId || null,
        reference: dto.reference?.trim() || null,
        createdById: user.id,
        ...(inviteeIds.length > 0
          ? {
              invitees: {
                createMany: {
                  data: inviteeIds.map((userId) => ({ userId })),
                  skipDuplicates: true,
                },
              },
            }
          : {}),
      },
      include: eventInclude,
    });

    if (dto.imageKey?.trim()) {
      const relocated = await this.relocateImage(
        created.id,
        dto.imageKey,
        null,
        user.id,
      );
      if (relocated) {
        const updated = await this.db.travelEvent.update({
          where: { id: created.id },
          data: { imageKey: relocated },
          include: eventInclude,
        });
        await this.enqueueThumbnail(created.id);
        return this.toDto(updated);
      }
    }

    return this.toDto(created);
  }

  async update(
    id: string,
    user: User,
    dto: UpdateTravelEventDto,
  ): Promise<TravelEventDto> {
    const existing = await this.db.travelEvent.findFirst({
      where: { id, isDeleted: false },
      include: eventInclude,
    });
    if (!existing) throw new NotFoundException('Event not found');

    const isEditor = await this.access.canEdit(user);
    if (!isEditor && existing.createdById !== user.id) {
      throw new ForbiddenException('Not allowed to edit this event');
    }

    const startAt = dto.startAt ? new Date(dto.startAt) : existing.startAt;
    const endAt = dto.endAt ? new Date(dto.endAt) : existing.endAt;
    if (endAt < startAt) {
      throw new BadRequestException('Event end date must be after start date');
    }

    let mapsPatch: {
      mapsUrl?: string | null;
      latitude?: number | null;
      longitude?: number | null;
    } = {};
    if (dto.mapsUrl !== undefined) {
      const normalized = dto.mapsUrl?.trim() || null;
      const coords = normalized ? await resolveMapsLocation(normalized) : null;
      mapsPatch = {
        mapsUrl: normalized,
        latitude: coords?.coordinates?.latitude ?? null,
        longitude: coords?.coordinates?.longitude ?? null,
      };
    }

    let imagePatch: {
      imageKey?: string | null;
      thumbnailKey?: string | null;
      previewKey?: string | null;
    } = {};
    const keysToDelete: string[] = [];
    let needsThumbnail = false;

    if (dto.imageKey !== undefined) {
      const nextKey = await this.relocateImage(
        id,
        dto.imageKey,
        existing.imageKey,
        user.id,
      );
      if (nextKey !== existing.imageKey) {
        imagePatch = {
          imageKey: nextKey,
          thumbnailKey: null,
          previewKey: null,
        };
        if (existing.imageKey) keysToDelete.push(existing.imageKey);
        if (existing.thumbnailKey) keysToDelete.push(existing.thumbnailKey);
        if (existing.previewKey) keysToDelete.push(existing.previewKey);
        needsThumbnail = Boolean(nextKey);
      }
    }

    if (dto.inviteeIds !== undefined) {
      await this.db.travelEventInvitee.deleteMany({ where: { eventId: id } });
      const uniqueInvitees = Array.from(new Set(dto.inviteeIds));
      if (uniqueInvitees.length > 0) {
        await this.db.travelEventInvitee.createMany({
          data: uniqueInvitees.map((userId) => ({ eventId: id, userId })),
          skipDuplicates: true,
        });
      }
    }

    const updated = await this.db.travelEvent.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description?.trim() || null }
          : {}),
        ...(dto.isYearly !== undefined ? { isYearly: dto.isYearly } : {}),
        ...(dto.visibility !== undefined ? { visibility: dto.visibility } : {}),
        startAt,
        endAt,
        ...(dto.location !== undefined
          ? { location: dto.location?.trim() || null }
          : {}),
        ...(dto.areaId !== undefined ? { areaId: dto.areaId || null } : {}),
        ...(dto.placeId !== undefined ? { placeId: dto.placeId || null } : {}),
        ...(dto.reference !== undefined
          ? { reference: dto.reference?.trim() || null }
          : {}),
        ...mapsPatch,
        ...imagePatch,
      },
      include: eventInclude,
    });

    await Promise.all(keysToDelete.map((k) => this.storageCleanup.delete(k)));
    if (needsThumbnail) {
      await this.enqueueThumbnail(id);
    }

    return this.toDto(updated);
  }

  async softDelete(id: string, user: User): Promise<void> {
    const existing = await this.db.travelEvent.findFirst({
      where: { id, isDeleted: false },
      select: { id: true, createdById: true },
    });
    if (!existing) throw new NotFoundException('Event not found');

    const isEditor = await this.access.canEdit(user);
    if (!isEditor && existing.createdById !== user.id) {
      throw new ForbiddenException('Not allowed to delete this event');
    }

    await this.db.travelEvent.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async listAdmin(query: TravelAdminEventQueryDto): Promise<TravelEventDto[]> {
    const q = query.q?.trim();
    const rows = await this.db.travelEvent.findMany({
      where: {
        isDeleted: false,
        ...(query.approved !== undefined ? { isApproved: query.approved } : {}),
        ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
      },
      include: eventInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toDto(row));
  }

  async approve(id: string): Promise<TravelEventDto> {
    const existing = await this.db.travelEvent.findFirst({
      where: { id, isDeleted: false },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Event not found');

    const updated = await this.db.travelEvent.update({
      where: { id },
      data: { isApproved: true },
      include: eventInclude,
    });
    return this.toDto(updated);
  }

  async hardDelete(id: string, actorId: string): Promise<void> {
    const event = await this.db.travelEvent.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        imageKey: true,
        thumbnailKey: true,
        previewKey: true,
        participations: { select: { userId: true } },
        participationGroups: {
          select: {
            images: {
              select: { key: true, thumbnailKey: true, previewKey: true },
            },
            activities: {
              select: {
                imageKey: true,
                thumbnailKey: true,
                previewKey: true,
                media: {
                  select: { key: true, thumbnailKey: true, previewKey: true },
                },
              },
            },
          },
        },
      },
    });
    if (!event) throw new NotFoundException('Event not found');

    const keys: string[] = [];
    const pushKey = (k: string | null | undefined) => {
      if (k) keys.push(k);
    };
    pushKey(event.imageKey);
    pushKey(event.thumbnailKey);
    pushKey(event.previewKey);
    for (const group of event.participationGroups) {
      for (const img of group.images) {
        pushKey(img.key);
        pushKey(img.thumbnailKey);
        pushKey(img.previewKey);
      }
      for (const act of group.activities) {
        pushKey(act.imageKey);
        pushKey(act.thumbnailKey);
        pushKey(act.previewKey);
        for (const m of act.media) {
          pushKey(m.key);
          pushKey(m.thumbnailKey);
          pushKey(m.previewKey);
        }
      }
    }

    const participantUserIds = Array.from(
      new Set(event.participations.map((p) => p.userId)),
    ).filter((uid) => uid !== actorId);

    await this.db.travelParticipation.deleteMany({ where: { eventId: id } });
    await this.db.travelEvent.delete({ where: { id } });

    if (participantUserIds.length > 0) {
      await this.db.notification.createMany({
        data: participantUserIds.map((recipientId) => ({
          recipientId,
          actorId,
          scope: AppScope.TRAVEL,
          type: NotificationType.TRAVEL_EVENT_DELETED,
          subjectId: randomUUID(),
          data: { eventId: event.id, eventTitle: event.title },
        })),
      });
    }

    await Promise.all(keys.map((k) => this.storageCleanup.delete(k)));
  }

  private async relocateImage(
    eventId: string,
    key: string | null,
    existingKey: string | null,
    uploaderId: string,
  ): Promise<string | null> {
    const trimmed = key?.trim() ?? '';
    if (!trimmed) return null;
    if (trimmed === existingKey) return existingKey;
    if (!isStagedKey(trimmed)) {
      throw new BadRequestException(`Unknown image key: ${trimmed}`);
    }
    if (!trimmed.startsWith(`${STAGING_PREFIX}/${uploaderId}/`)) {
      throw new BadRequestException("Cannot claim another uploader's file");
    }
    const target = travelEventImageKeyFor(eventId, trimmed);
    await this.storage.moveObject(trimmed, target);
    return target;
  }

  private async enqueueThumbnail(eventId: string): Promise<void> {
    try {
      await this.thumbnailExecutor.execute(eventId);
    } catch (error) {
      this.logger.warn(
        `Immediate thumbnail generation failed for event ${eventId}, queueing retry: ${error instanceof Error ? error.message : String(error)}`,
      );
      await this.processQueue.enqueueFailure(
        ProcessType.TRAVEL_EVENT_THUMBNAIL,
        eventId,
        error,
      );
    }
  }

  private toDto(row: EventRow): TravelEventDto {
    const imageUrl = row.imageKey
      ? this.storage.getPublicUrl(row.imageKey)
      : null;
    const thumbnailUrl = row.thumbnailKey
      ? this.storage.getPublicUrl(row.thumbnailKey)
      : imageUrl;
    const previewUrl = row.previewKey
      ? this.storage.getPublicUrl(row.previewKey)
      : imageUrl;

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      imageKey: row.imageKey,
      imageUrl,
      thumbnailUrl,
      previewUrl,
      isApproved: row.isApproved,
      isYearly: row.isYearly,
      visibility: row.visibility,
      startAt: row.startAt.toISOString(),
      endAt: row.endAt.toISOString(),
      location: row.location,
      mapsUrl: row.mapsUrl,
      latitude: row.latitude,
      longitude: row.longitude,
      areaId: row.areaId,
      placeId: row.placeId,
      reference: row.reference,
      createdBy: toTravelCreatorDto(row.createdBy),
      inviteeIds: row.invitees.map((i) => i.userId),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
