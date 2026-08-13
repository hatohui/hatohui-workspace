import { Injectable, NotFoundException } from '@nestjs/common';
import { Database, type PrismaTransactionClient } from '@/libs/db';
import { Cache, CACHE_KEYS } from '@/libs/cache';
import {
  PUBLIC_USER_SELECT,
  toPublicUserDto,
  type PublicUserSource,
} from '@/modules/users/dto/public-user.dto';
import {
  ConnectionStatus,
  NotificationType,
  Prisma,
  type AppScope,
  type Notification,
  type User,
} from '@prisma/client';
import {
  NotificationDto,
  PaginatedNotificationsDto,
  UnreadCountDto,
} from './dto/notification.dto';

type NotificationWithActor = Notification & {
  actor: PublicUserSource | null;
};

interface CreateNotificationInput {
  recipientId: string;
  actorId?: string | null;
  type: NotificationType;
  scope?: AppScope;
  subjectId?: string | null;
  data?: Prisma.InputJsonValue;
}

const UNREAD_COUNT_TTL_SECONDS = 300;

@Injectable()
export class NotificationsService {
  constructor(
    private readonly db: Database,
    private readonly cache: Cache,
  ) {}

  async list(
    viewer: User,
    page: number,
    pageSize: number,
  ): Promise<PaginatedNotificationsDto> {
    const where = { recipientId: viewer.id };

    const [rows, total, unreadCount] = await Promise.all([
      this.db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { actor: { select: PUBLIC_USER_SELECT } },
      }),
      this.db.notification.count({ where }),
      this.db.notification.count({ where: { ...where, readAt: null } }),
    ]);

    const items = await this.resolve(rows, viewer);
    return { items, total, page, pageSize, unreadCount };
  }

  /// Polled by the bell on every page, so it is cached.
  async unreadCount(viewer: User): Promise<UnreadCountDto> {
    const count = await this.cache.getOrSet(
      CACHE_KEYS.unreadNotifications(viewer.id),
      UNREAD_COUNT_TTL_SECONDS,
      () =>
        this.db.notification.count({
          where: { recipientId: viewer.id, readAt: null },
        }),
    );
    return { count };
  }

  invalidateUnread(...userIds: string[]): Promise<void> {
    return this.cache.invalidate(
      ...userIds.map((id) => CACHE_KEYS.unreadNotifications(id)),
    );
  }

  async markRead(id: string, viewer: User): Promise<void> {
    const result = await this.db.notification.updateMany({
      where: { id, recipientId: viewer.id, readAt: null },
      data: { readAt: new Date() },
    });
    if (result.count === 0) {
      const exists = await this.db.notification.findFirst({
        where: { id, recipientId: viewer.id },
        select: { id: true },
      });
      if (!exists) throw new NotFoundException(`Notification ${id} not found`);
      return;
    }
    await this.invalidateUnread(viewer.id);
  }

  async markAllRead(viewer: User): Promise<void> {
    await this.db.notification.updateMany({
      where: { recipientId: viewer.id, readAt: null },
      data: { readAt: new Date() },
    });
    await this.invalidateUnread(viewer.id);
  }

  /// Subjects are resolved here rather than denormalized onto the row:
  /// handles are mutable and entries get field-cleared, so a stored copy would
  /// go stale or keep leaking after a visibility change. Batched by type, so
  /// page size doesn't change the query count. A dangling subjectId is
  /// expected (no FK), so those rows are dropped rather than throwing.
  private async resolve(
    rows: NotificationWithActor[],
    viewer: User,
  ): Promise<NotificationDto[]> {
    const connectionIds = rows
      .filter(
        (row) =>
          row.type === NotificationType.CONNECTION_REQUEST ||
          row.type === NotificationType.CONNECTION_ACCEPTED,
      )
      .map((row) => row.subjectId)
      .filter((id): id is string => id !== null);

    const connections =
      connectionIds.length > 0
        ? await this.db.connection.findMany({
            where: { id: { in: connectionIds } },
            select: { id: true, status: true, addresseeId: true },
          })
        : [];
    const connectionById = new Map(connections.map((c) => [c.id, c]));

    return rows
      .filter((row) => {
        if (
          row.type !== NotificationType.CONNECTION_REQUEST &&
          row.type !== NotificationType.CONNECTION_ACCEPTED
        ) {
          return true;
        }
        return row.subjectId !== null && connectionById.has(row.subjectId);
      })
      .map((row) => {
        const connection = row.subjectId
          ? connectionById.get(row.subjectId)
          : undefined;
        return {
          id: row.id,
          type: row.type,
          scope: row.scope,
          actor: row.actor ? toPublicUserDto(row.actor) : null,
          subjectId: row.subjectId,
          // Only a still-pending request addressed to the viewer can be acted on.
          isActionable:
            row.type === NotificationType.CONNECTION_REQUEST &&
            connection?.status === ConnectionStatus.PENDING &&
            connection.addresseeId === viewer.id,
          readAt: row.readAt?.toISOString() ?? null,
          createdAt: row.createdAt.toISOString(),
        };
      });
  }

  /// Upserts on (recipient, type, subject) so a retried or double-submitted
  /// action cannot produce two identical inbox items.
  emit(
    tx: PrismaTransactionClient,
    input: CreateNotificationInput,
  ): Promise<Notification> {
    const data = {
      recipientId: input.recipientId,
      actorId: input.actorId ?? null,
      type: input.type,
      subjectId: input.subjectId ?? null,
      ...(input.scope ? { scope: input.scope } : {}),
      ...(input.data ? { data: input.data } : {}),
    };

    // Postgres treats NULLs as distinct, so a subject-less notification can't
    // be addressed by the unique triple — there's nothing to collide with
    // either, so a plain create is both correct and the only option.
    if (input.subjectId == null) {
      return tx.notification.create({ data });
    }

    return tx.notification.upsert({
      where: {
        recipientId_type_subjectId: {
          recipientId: input.recipientId,
          type: input.type,
          subjectId: input.subjectId,
        },
      },
      create: data,
      update: { ...data, readAt: null },
    });
  }

  /// Used when the subject is deleted, so the inbox never shows a dead item
  /// with live-looking action buttons.
  discardForSubject(
    tx: PrismaTransactionClient,
    type: NotificationType,
    subjectId: string,
  ): Promise<{ count: number }> {
    return tx.notification.deleteMany({ where: { type, subjectId } });
  }

  /// Marks read without deleting, so it survives as history.
  settleForSubject(
    tx: PrismaTransactionClient,
    recipientId: string,
    type: NotificationType,
    subjectId: string,
  ): Promise<{ count: number }> {
    return tx.notification.updateMany({
      where: { recipientId, type, subjectId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
