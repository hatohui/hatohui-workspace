import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProcessType } from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import {
  STAGING_PREFIX,
  isStagedKey,
  travelActivityImageKeyFor,
  travelGroupImageKeyFor,
} from '@/common/utils/asset-paths';
import { resolveMapsLocation } from '@/common/utils/maps-coordinates';
import { ProcessQueueService } from '@/modules/process-queue/services/process-queue.service';
import { StorageCleanupService } from '@/modules/storage-cleanup/services/storage-cleanup.service';
import {
  CreateTravelActivityDto,
  CreateTravelMediaDto,
  TravelActivityDto,
  TravelMediaItemDto,
  TravelMediaQueryDto,
  UpdateTravelActivityDto,
} from '@/modules/travel-activities/dto/travel-activity.dto';
import {
  TravelActivityImageThumbnailExecutor,
  TravelActivityMediaThumbnailExecutor,
  TravelGroupImageThumbnailExecutor,
} from '@/modules/travel-activities/services/travel-media-thumbnail.executors';

const activityInclude = {
  place: { select: { id: true, name: true, mapsUrl: true } },
  spot: { select: { id: true, name: true, mapsUrl: true } },
  media: { orderBy: { createdAt: 'desc' as const } },
} satisfies Prisma.TravelActivityInclude;

type ActivityRow = Prisma.TravelActivityGetPayload<{
  include: typeof activityInclude;
}>;

@Injectable()
export class TravelActivitiesService {
  private readonly logger = new Logger(TravelActivitiesService.name);

  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly processQueue: ProcessQueueService,
    private readonly storageCleanup: StorageCleanupService,
    private readonly groupImageThumb: TravelGroupImageThumbnailExecutor,
    private readonly activityImageThumb: TravelActivityImageThumbnailExecutor,
    private readonly activityMediaThumb: TravelActivityMediaThumbnailExecutor,
  ) {}

  async listActivities(
    participationId: string,
    viewerId?: string,
  ): Promise<TravelActivityDto[]> {
    const { group, isMember } = await this.resolveAccess(
      participationId,
      viewerId,
    );
    if (!isMember && (!group.isPublic || !group.isActivityPublicVisible)) {
      return [];
    }

    const rows = await this.db.travelActivity.findMany({
      where: { groupId: group.id },
      include: activityInclude,
      orderBy: { from: 'asc' },
    });
    return rows.map((row) => this.toActivityDto(row));
  }

  async createActivity(
    participationId: string,
    userId: string,
    dto: CreateTravelActivityDto,
  ): Promise<TravelActivityDto> {
    const { group, isMember } = await this.resolveAccess(
      participationId,
      userId,
    );
    if (!isMember) {
      throw new ForbiddenException('Only group members can add activities');
    }

    const from = new Date(dto.from);
    const to = new Date(dto.to);
    if (to < from) {
      throw new BadRequestException('Activity end must be after start');
    }

    const mapsUrl = dto.mapsUrl?.trim() || null;
    const coords = mapsUrl ? await resolveMapsLocation(mapsUrl) : null;

    const created = await this.db.travelActivity.create({
      data: {
        groupId: group.id,
        name: dto.name.trim(),
        from,
        to,
        placeId: dto.placeId || null,
        spotId: dto.spotId || null,
        location: dto.location?.trim() || null,
        mapsUrl,
        latitude: coords?.coordinates?.latitude ?? null,
        longitude: coords?.coordinates?.longitude ?? null,
        involvedPeople: Array.from(new Set(dto.involvedPeople ?? [])),
        isExcludeMode: dto.isExcludeMode ?? false,
        note: dto.note?.trim() || null,
        createdById: userId,
      },
      include: activityInclude,
    });

    if (dto.imageKey?.trim()) {
      const relocated = await this.relocateStaged(dto.imageKey, userId, (key) =>
        travelActivityImageKeyFor(created.id, key),
      );
      const updated = await this.db.travelActivity.update({
        where: { id: created.id },
        data: { imageKey: relocated },
        include: activityInclude,
      });
      await this.runOrQueue(
        ProcessType.TRAVEL_ACTIVITY_IMAGE_THUMBNAIL,
        created.id,
        () => this.activityImageThumb.execute(created.id),
      );
      return this.toActivityDto(updated);
    }

    return this.toActivityDto(created);
  }

  async updateActivity(
    participationId: string,
    activityId: string,
    userId: string,
    dto: UpdateTravelActivityDto,
  ): Promise<TravelActivityDto> {
    const { group } = await this.resolveAccess(participationId, userId);
    const existing = await this.db.travelActivity.findFirst({
      where: { id: activityId, groupId: group.id },
    });
    if (!existing) throw new NotFoundException('Activity not found');
    if (group.ownerId !== userId && existing.createdById !== userId) {
      throw new ForbiddenException('Not allowed to edit this activity');
    }

    const from = dto.from ? new Date(dto.from) : existing.from;
    const to = dto.to ? new Date(dto.to) : existing.to;
    if (to < from) {
      throw new BadRequestException('Activity end must be after start');
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

    const keysToDelete: string[] = [];
    let imagePatch: {
      imageKey?: string | null;
      thumbnailKey?: string | null;
      previewKey?: string | null;
    } = {};
    let needsThumb = false;

    if (dto.imageKey !== undefined) {
      const trimmed = dto.imageKey?.trim() ?? '';
      const nextKey = !trimmed
        ? null
        : trimmed === existing.imageKey
          ? existing.imageKey
          : await this.relocateStaged(trimmed, userId, (key) =>
              travelActivityImageKeyFor(activityId, key),
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
        needsThumb = Boolean(nextKey);
      }
    }

    const updated = await this.db.travelActivity.update({
      where: { id: activityId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        from,
        to,
        ...(dto.placeId !== undefined ? { placeId: dto.placeId || null } : {}),
        ...(dto.spotId !== undefined ? { spotId: dto.spotId || null } : {}),
        ...(dto.location !== undefined
          ? { location: dto.location?.trim() || null }
          : {}),
        ...(dto.involvedPeople !== undefined
          ? { involvedPeople: Array.from(new Set(dto.involvedPeople)) }
          : {}),
        ...(dto.isExcludeMode !== undefined
          ? { isExcludeMode: dto.isExcludeMode }
          : {}),
        ...(dto.note !== undefined ? { note: dto.note?.trim() || null } : {}),
        ...mapsPatch,
        ...imagePatch,
      },
      include: activityInclude,
    });

    await Promise.all(keysToDelete.map((k) => this.storageCleanup.delete(k)));
    if (needsThumb) {
      await this.runOrQueue(
        ProcessType.TRAVEL_ACTIVITY_IMAGE_THUMBNAIL,
        activityId,
        () => this.activityImageThumb.execute(activityId),
      );
    }

    return this.toActivityDto(updated);
  }

  async deleteActivity(
    participationId: string,
    activityId: string,
    userId: string,
  ): Promise<void> {
    const { group } = await this.resolveAccess(participationId, userId);
    const existing = await this.db.travelActivity.findFirst({
      where: { id: activityId, groupId: group.id },
      include: { media: true },
    });
    if (!existing) throw new NotFoundException('Activity not found');
    if (group.ownerId !== userId && existing.createdById !== userId) {
      throw new ForbiddenException('Not allowed to delete this activity');
    }

    const keys: string[] = [];
    const push = (k: string | null | undefined) => {
      if (k) keys.push(k);
    };
    push(existing.imageKey);
    push(existing.thumbnailKey);
    push(existing.previewKey);
    for (const m of existing.media) {
      push(m.key);
      push(m.thumbnailKey);
      push(m.previewKey);
    }

    await this.db.travelActivity.delete({ where: { id: activityId } });
    await Promise.all(keys.map((k) => this.storageCleanup.delete(k)));
  }

  async listGallery(
    participationId: string,
    query: TravelMediaQueryDto,
    viewerId?: string,
  ): Promise<TravelMediaItemDto[]> {
    const { group, isMember } = await this.resolveAccess(
      participationId,
      viewerId,
    );
    if (!isMember && (!group.isPublic || !group.isMediaPublicVisible)) {
      return [];
    }

    const [groupImages, activityMedia] = await Promise.all([
      query.activityId
        ? Promise.resolve([])
        : this.db.travelGroupImage.findMany({
            where: {
              groupId: group.id,
              ...(query.uploadedById
                ? { uploadedById: query.uploadedById }
                : {}),
            },
            orderBy: { createdAt: 'desc' },
          }),
      this.db.travelActivityMedia.findMany({
        where: {
          activity: { groupId: group.id },
          ...(query.activityId ? { activityId: query.activityId } : {}),
          ...(query.uploadedById ? { uploadedById: query.uploadedById } : {}),
        },
        include: { activity: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const items: TravelMediaItemDto[] = [
      ...groupImages.map((img) => this.toGroupMediaDto(img)),
      ...activityMedia.map((m) => this.toActivityMediaDto(m, m.activity.name)),
    ];

    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async addGroupImage(
    participationId: string,
    userId: string,
    dto: CreateTravelMediaDto,
  ): Promise<TravelMediaItemDto> {
    const { group, isMember } = await this.resolveAccess(
      participationId,
      userId,
    );
    if (!isMember) {
      throw new ForbiddenException('Only group members can upload photos');
    }

    const key = await this.relocateStaged(dto.key, userId, (staged) =>
      travelGroupImageKeyFor(group.id, staged),
    );
    const created = await this.db.travelGroupImage.create({
      data: {
        groupId: group.id,
        key,
        caption: dto.caption?.trim() || null,
        uploadedById: userId,
      },
    });
    await this.runOrQueue(
      ProcessType.TRAVEL_GROUP_IMAGE_THUMBNAIL,
      created.id,
      () => this.groupImageThumb.execute(created.id),
    );
    const refreshed =
      (await this.db.travelGroupImage.findUnique({
        where: { id: created.id },
      })) ?? created;
    return this.toGroupMediaDto(refreshed);
  }

  async deleteGroupImage(
    participationId: string,
    imageId: string,
    userId: string,
  ): Promise<void> {
    const { group } = await this.resolveAccess(participationId, userId);
    const existing = await this.db.travelGroupImage.findFirst({
      where: { id: imageId, groupId: group.id },
    });
    if (!existing) throw new NotFoundException('Photo not found');
    if (group.ownerId !== userId && existing.uploadedById !== userId) {
      throw new ForbiddenException('Not allowed to delete this photo');
    }

    await this.db.travelGroupImage.delete({ where: { id: imageId } });
    const keys = [
      existing.key,
      existing.thumbnailKey,
      existing.previewKey,
    ].filter((k): k is string => Boolean(k));
    await Promise.all(keys.map((k) => this.storageCleanup.delete(k)));
  }

  async addActivityMedia(
    participationId: string,
    activityId: string,
    userId: string,
    dto: CreateTravelMediaDto,
  ): Promise<TravelMediaItemDto> {
    const { group, isMember } = await this.resolveAccess(
      participationId,
      userId,
    );
    if (!isMember) {
      throw new ForbiddenException('Only group members can upload photos');
    }

    const activity = await this.db.travelActivity.findFirst({
      where: { id: activityId, groupId: group.id },
      select: { id: true, name: true },
    });
    if (!activity) throw new NotFoundException('Activity not found');

    const key = await this.relocateStaged(dto.key, userId, (staged) =>
      travelActivityImageKeyFor(activityId, staged),
    );
    const created = await this.db.travelActivityMedia.create({
      data: {
        activityId,
        key,
        caption: dto.caption?.trim() || null,
        uploadedById: userId,
      },
    });
    await this.runOrQueue(
      ProcessType.TRAVEL_ACTIVITY_MEDIA_THUMBNAIL,
      created.id,
      () => this.activityMediaThumb.execute(created.id),
    );
    const refreshed =
      (await this.db.travelActivityMedia.findUnique({
        where: { id: created.id },
      })) ?? created;
    return this.toActivityMediaDto(refreshed, activity.name);
  }

  async deleteActivityMedia(
    participationId: string,
    activityId: string,
    mediaId: string,
    userId: string,
  ): Promise<void> {
    const { group } = await this.resolveAccess(participationId, userId);
    const existing = await this.db.travelActivityMedia.findFirst({
      where: { id: mediaId, activityId, activity: { groupId: group.id } },
    });
    if (!existing) throw new NotFoundException('Photo not found');
    if (group.ownerId !== userId && existing.uploadedById !== userId) {
      throw new ForbiddenException('Not allowed to delete this photo');
    }

    await this.db.travelActivityMedia.delete({ where: { id: mediaId } });
    const keys = [
      existing.key,
      existing.thumbnailKey,
      existing.previewKey,
    ].filter((k): k is string => Boolean(k));
    await Promise.all(keys.map((k) => this.storageCleanup.delete(k)));
  }

  private async resolveAccess(participationId: string, viewerId?: string) {
    const participation = await this.db.travelParticipation.findUnique({
      where: { id: participationId },
      include: { group: true },
    });
    if (!participation?.group) {
      throw new NotFoundException('Travel plan not found');
    }

    const isMember = viewerId
      ? Boolean(
          await this.db.travelParticipation.findFirst({
            where: { groupId: participation.group.id, userId: viewerId },
            select: { id: true },
          }),
        )
      : false;

    if (!isMember && !participation.group.isPublic) {
      throw new ForbiddenException('This travel plan is private');
    }

    return { group: participation.group, isMember };
  }

  private async relocateStaged(
    rawKey: string,
    uploaderId: string,
    targetFor: (stagedKey: string) => string,
  ): Promise<string> {
    const trimmed = rawKey.trim();
    if (!isStagedKey(trimmed)) {
      throw new BadRequestException(`Unknown image key: ${trimmed}`);
    }
    if (!trimmed.startsWith(`${STAGING_PREFIX}/${uploaderId}/`)) {
      throw new BadRequestException("Cannot claim another uploader's file");
    }
    const target = targetFor(trimmed);
    await this.storage.moveObject(trimmed, target);
    return target;
  }

  private async runOrQueue(
    type: ProcessType,
    refId: string,
    run: () => Promise<void>,
  ): Promise<void> {
    try {
      await run();
    } catch (error) {
      this.logger.warn(
        `Immediate thumbnail failed for ${type}:${refId}, queueing retry: ${error instanceof Error ? error.message : String(error)}`,
      );
      await this.processQueue.enqueueFailure(type, refId, error);
    }
  }

  private toGroupMediaDto(img: {
    id: string;
    key: string;
    thumbnailKey: string | null;
    previewKey: string | null;
    caption: string | null;
    uploadedById: string | null;
    createdAt: Date;
  }): TravelMediaItemDto {
    const url = this.storage.getPublicUrl(img.key);
    return {
      id: img.id,
      source: 'GROUP',
      key: img.key,
      url,
      thumbnailUrl: img.thumbnailKey
        ? this.storage.getPublicUrl(img.thumbnailKey)
        : url,
      previewUrl: img.previewKey
        ? this.storage.getPublicUrl(img.previewKey)
        : url,
      caption: img.caption,
      uploadedById: img.uploadedById,
      activityId: null,
      activityName: null,
      createdAt: img.createdAt.toISOString(),
    };
  }

  private toActivityMediaDto(
    media: {
      id: string;
      activityId: string;
      key: string;
      thumbnailKey: string | null;
      previewKey: string | null;
      caption: string | null;
      uploadedById: string | null;
      createdAt: Date;
    },
    activityName: string,
  ): TravelMediaItemDto {
    const url = this.storage.getPublicUrl(media.key);
    return {
      id: media.id,
      source: 'ACTIVITY',
      key: media.key,
      url,
      thumbnailUrl: media.thumbnailKey
        ? this.storage.getPublicUrl(media.thumbnailKey)
        : url,
      previewUrl: media.previewKey
        ? this.storage.getPublicUrl(media.previewKey)
        : url,
      caption: media.caption,
      uploadedById: media.uploadedById,
      activityId: media.activityId,
      activityName,
      createdAt: media.createdAt.toISOString(),
    };
  }

  private toActivityDto(row: ActivityRow): TravelActivityDto {
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
      groupId: row.groupId,
      name: row.name,
      from: row.from.toISOString(),
      to: row.to.toISOString(),
      place: row.place
        ? {
            id: row.place.id,
            name: row.place.name,
            mapsUrl: row.place.mapsUrl,
          }
        : null,
      spot: row.spot
        ? {
            id: row.spot.id,
            name: row.spot.name,
            mapsUrl: row.spot.mapsUrl,
          }
        : null,
      location: row.location,
      mapsUrl: row.mapsUrl,
      latitude: row.latitude,
      longitude: row.longitude,
      involvedPeople: row.involvedPeople,
      isExcludeMode: row.isExcludeMode,
      note: row.note,
      imageKey: row.imageKey,
      imageUrl,
      thumbnailUrl,
      previewUrl,
      createdById: row.createdById,
      media: row.media.map((m) => this.toActivityMediaDto(m, row.name)),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
