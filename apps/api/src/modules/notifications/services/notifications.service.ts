import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Database, type PrismaTransactionClient } from '@/infra/db';
import { Cache, CACHE_KEYS } from '@/infra/cache';
import { ProcessQueueService } from '@/modules/process-queue/services/process-queue.service';
import { NotificationEmailService } from '@/modules/notifications/services/notification-email.service';
import {
  PUBLIC_USER_SELECT,
  toPublicUserDto,
  type PublicUserSource,
} from '@/modules/users/dto/public-user.dto';
import {
  ConnectionStatus,
  NotificationType,
  Prisma,
  ProcessType,
  type AppScope,
  type Notification,
  type User,
} from '@prisma/client';
import {
  NotificationDto,
  PaginatedNotificationsDto,
  UnreadCountDto,
} from '@/modules/notifications/dto/notification.dto';
import {
  CONNECTION_LIFECYCLE_TYPES,
  EMAILED_NOTIFICATION_TYPES,
  UNREAD_COUNT_TTL_SECONDS,
} from '@/modules/notifications/notifications.constants';

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
  /// Self-history items (e.g. "you accepted X") are already seen by
  /// definition — the viewer just performed the action — so they're created
  /// pre-read instead of adding to the unread badge.
  read?: boolean;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly db: Database,
    private readonly cache: Cache,
    private readonly processQueue: ProcessQueueService,
    private readonly notificationEmail: NotificationEmailService,
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
      .filter((row) => CONNECTION_LIFECYCLE_TYPES.has(row.type))
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
        if (!CONNECTION_LIFECYCLE_TYPES.has(row.type)) return true;
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
  /// action cannot produce two identical inbox items. An emailable type also
  /// gets a NOTIFICATION_EMAIL queue row in the same transaction — the
  /// guaranteed delivery path; flushEmail() is the best-effort fast path.
  async emit(
    tx: PrismaTransactionClient,
    input: CreateNotificationInput,
  ): Promise<Notification> {
    const readAt = input.read ? new Date() : null;
    const data = {
      recipientId: input.recipientId,
      actorId: input.actorId ?? null,
      type: input.type,
      subjectId: input.subjectId ?? null,
      readAt,
      ...(input.scope ? { scope: input.scope } : {}),
      ...(input.data ? { data: input.data } : {}),
    };

    // Postgres treats NULLs as distinct, so a subject-less notification can't
    // be addressed by the unique triple — there's nothing to collide with
    // either, so a plain create is both correct and the only option.
    const notification =
      input.subjectId == null
        ? await tx.notification.create({ data })
        : await tx.notification.upsert({
            where: {
              recipientId_type_subjectId: {
                recipientId: input.recipientId,
                type: input.type,
                subjectId: input.subjectId,
              },
            },
            create: data,
            update: { ...data, readAt },
          });

    if (!input.read && EMAILED_NOTIFICATION_TYPES.has(input.type)) {
      await tx.processQueue.upsert({
        where: {
          type_refId: {
            type: ProcessType.NOTIFICATION_EMAIL,
            refId: notification.id,
          },
        },
        create: {
          type: ProcessType.NOTIFICATION_EMAIL,
          refId: notification.id,
        },
        update: {},
      });
    }

    return notification;
  }

  /// Tries to send the notification email now so a request under quota lands
  /// immediately. A rate-limited or failed attempt is left for the cron,
  /// which drains the NOTIFICATION_EMAIL queue rows emit() wrote.
  async flushEmail(notificationIds: string[]): Promise<void> {
    for (const id of notificationIds) {
      try {
        const result = await this.notificationEmail.deliver(id);
        if (result !== 'queued') {
          await this.processQueue.clearForRef(
            ProcessType.NOTIFICATION_EMAIL,
            id,
          );
        }
      } catch (error) {
        this.logger.warn(
          `Immediate notification email failed for ${id}; left queued`,
          error instanceof Error ? error.stack : error,
        );
      }
    }
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

  async delete(id: string, viewer: User): Promise<void> {
    const row = await this.db.notification.findFirst({
      where: { id, recipientId: viewer.id },
    });
    if (!row) throw new NotFoundException(`Notification ${id} not found`);
    if (await this.isActionable(row, viewer)) {
      throw new BadRequestException(
        'Respond to this connection request before deleting it',
      );
    }
    await this.db.notification.delete({ where: { id } });
    await this.invalidateUnread(viewer.id);
  }

  /// Clears the settled inbox — everything but still-pending, still-actionable
  /// connection requests, which stay until the viewer responds.
  async clear(viewer: User): Promise<{ count: number }> {
    const pendingIncoming = await this.db.connection.findMany({
      where: { addresseeId: viewer.id, status: ConnectionStatus.PENDING },
      select: { id: true },
    });

    const result = await this.db.notification.deleteMany({
      where: {
        recipientId: viewer.id,
        NOT: {
          type: NotificationType.CONNECTION_REQUEST,
          subjectId: { in: pendingIncoming.map((c) => c.id) },
        },
      },
    });
    await this.invalidateUnread(viewer.id);
    return { count: result.count };
  }

  private async isActionable(
    row: Notification,
    viewer: User,
  ): Promise<boolean> {
    if (row.type !== NotificationType.CONNECTION_REQUEST || !row.subjectId) {
      return false;
    }
    const connection = await this.db.connection.findUnique({
      where: { id: row.subjectId },
      select: { status: true, addresseeId: true },
    });
    return (
      connection?.status === ConnectionStatus.PENDING &&
      connection.addresseeId === viewer.id
    );
  }
}
