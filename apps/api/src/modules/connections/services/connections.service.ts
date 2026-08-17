import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Database, type PrismaTransactionClient } from '@/infra/db';
import { Cache, CACHE_KEYS } from '@/infra/cache';
import { NotificationsService } from '@/modules/notifications/services/notifications.service';
import {
  PUBLIC_USER_SELECT,
  toPublicUserDto,
  type PublicUserSource,
} from '@/modules/users/dto/public-user.dto';
import {
  ConnectionStatus,
  NotificationType,
  type Connection,
  type User,
} from '@prisma/client';
import {
  ConnectionDto,
  ConnectionRequestsDto,
  ConnectionsDto,
} from '@/modules/connections/dto/connection.dto';
import {
  CONNECTION_CONTEXT_TTL_SECONDS,
  type ConnectionState,
} from '@/modules/connections/connections.constants';

type ConnectionWithUsers = Connection & {
  requester: PublicUserSource;
  addressee: PublicUserSource;
};

const withUsers = {
  requester: { select: PUBLIC_USER_SELECT },
  addressee: { select: PUBLIC_USER_SELECT },
} as const;

/// Read on nearly every friends request, so it is cached and invalidated
/// explicitly rather than joined onto each entry query.
export interface ConnectionContext {
  connectedUserIds: Set<string>;
  pendingOutgoingUserIds: Set<string>;
  pendingIncomingUserIds: Set<string>;
}

/// Redis can't hold Sets, so the cached form is arrays.
interface CachedConnectionContext {
  connected: string[];
  pendingOutgoing: string[];
  pendingIncoming: string[];
}

export const EMPTY_CONNECTION_CONTEXT: ConnectionContext = {
  connectedUserIds: new Set(),
  pendingOutgoingUserIds: new Set(),
  pendingIncomingUserIds: new Set(),
};

@Injectable()
export class ConnectionsService {
  constructor(
    private readonly db: Database,
    private readonly notifications: NotificationsService,
    private readonly cache: Cache,
  ) {}

  async getContext(userId: string | null): Promise<ConnectionContext> {
    if (!userId) return EMPTY_CONNECTION_CONTEXT;

    const cached = await this.cache.getOrSet(
      CACHE_KEYS.connectionContext(userId),
      CONNECTION_CONTEXT_TTL_SECONDS,
      () => this.loadContext(userId),
    );

    return {
      connectedUserIds: new Set(cached.connected),
      pendingOutgoingUserIds: new Set(cached.pendingOutgoing),
      pendingIncomingUserIds: new Set(cached.pendingIncoming),
    };
  }

  private async loadContext(userId: string): Promise<CachedConnectionContext> {
    const rows = await this.db.connection.findMany({
      where: {
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      select: { requesterId: true, addresseeId: true, status: true },
    });

    const result: CachedConnectionContext = {
      connected: [],
      pendingOutgoing: [],
      pendingIncoming: [],
    };

    for (const row of rows) {
      const isOutgoing = row.requesterId === userId;
      const otherId = isOutgoing ? row.addresseeId : row.requesterId;
      if (row.status === ConnectionStatus.ACCEPTED) {
        result.connected.push(otherId);
      } else if (isOutgoing) {
        result.pendingOutgoing.push(otherId);
      } else {
        result.pendingIncoming.push(otherId);
      }
    }

    return result;
  }

  /// Call after a mutation commits, for both sides. Every connection change
  /// also moves a notification, so the unread badge goes too.
  async invalidateFor(...userIds: string[]): Promise<void> {
    await Promise.all([
      this.cache.invalidate(
        ...userIds.map((id) => CACHE_KEYS.connectionContext(id)),
      ),
      this.notifications.invalidateUnread(...userIds),
    ]);
  }

  async list(viewer: User): Promise<ConnectionsDto> {
    const rows = await this.db.connection.findMany({
      where: {
        status: ConnectionStatus.ACCEPTED,
        OR: [{ requesterId: viewer.id }, { addresseeId: viewer.id }],
      },
      orderBy: { respondedAt: 'desc' },
      include: withUsers,
    });
    return { connections: rows.map((row) => toConnectionDto(row, viewer)) };
  }

  async listRequests(viewer: User): Promise<ConnectionRequestsDto> {
    const rows = await this.db.connection.findMany({
      where: {
        status: ConnectionStatus.PENDING,
        OR: [{ requesterId: viewer.id }, { addresseeId: viewer.id }],
      },
      orderBy: { createdAt: 'desc' },
      include: withUsers,
    });

    return {
      incoming: rows
        .filter((row) => row.addresseeId === viewer.id)
        .map((row) => toConnectionDto(row, viewer)),
      outgoing: rows
        .filter((row) => row.requesterId === viewer.id)
        .map((row) => toConnectionDto(row, viewer)),
    };
  }

  /// Sends a request. If the other account already has a pending request out
  /// to the viewer, that one is accepted instead — mutual intent shouldn't
  /// deadlock into two unanswered requests pointing at each other.
  async request(targetUserId: string, viewer: User): Promise<ConnectionDto> {
    if (targetUserId === viewer.id) {
      throw new BadRequestException('You cannot connect with yourself');
    }

    const target = await this.db.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });
    if (!target) {
      throw new NotFoundException(`User ${targetUserId} not found`);
    }

    const existing = await this.db.connection.findFirst({
      where: {
        OR: [
          { requesterId: viewer.id, addresseeId: targetUserId },
          { requesterId: targetUserId, addresseeId: viewer.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === ConnectionStatus.ACCEPTED) {
        throw new ConflictException('You are already connected');
      }
      if (existing.addresseeId === viewer.id) {
        return this.accept(existing.id, viewer);
      }
      throw new ConflictException('A request is already pending');
    }

    const created = await this.db.$transaction(async (tx) => {
      const connection = await tx.connection.create({
        data: { requesterId: viewer.id, addresseeId: targetUserId },
        include: withUsers,
      });
      await this.notifications.emit(tx, {
        recipientId: targetUserId,
        actorId: viewer.id,
        type: NotificationType.CONNECTION_REQUEST,
        subjectId: connection.id,
      });
      return connection;
    });

    await this.invalidateFor(viewer.id, targetUserId);
    return toConnectionDto(created, viewer);
  }

  async accept(id: string, viewer: User): Promise<ConnectionDto> {
    const connection = await this.db.connection.findUnique({
      where: { id },
      include: withUsers,
    });
    if (!connection || connection.addresseeId !== viewer.id) {
      throw new NotFoundException(`Connection request ${id} not found`);
    }
    // Idempotent: accepting an already-accepted request is a no-op, not a 409.
    if (connection.status === ConnectionStatus.ACCEPTED) {
      return toConnectionDto(connection, viewer);
    }

    const accepted = await this.db.$transaction(async (tx) => {
      const updated = await tx.connection.update({
        where: { id },
        data: { status: ConnectionStatus.ACCEPTED, respondedAt: new Date() },
        include: withUsers,
      });
      // Superseded by the two history notifications below.
      await this.notifications.discardForSubject(
        tx,
        NotificationType.CONNECTION_REQUEST,
        id,
      );
      await this.notifications.emit(tx, {
        recipientId: viewer.id,
        actorId: updated.requesterId,
        type: NotificationType.CONNECTION_ACCEPTED_BY_YOU,
        subjectId: id,
        read: true,
      });
      await this.notifications.emit(tx, {
        recipientId: updated.requesterId,
        actorId: viewer.id,
        type: NotificationType.CONNECTION_ACCEPTED,
        subjectId: id,
      });
      return updated;
    });

    await this.invalidateFor(accepted.requesterId, accepted.addresseeId);
    return toConnectionDto(accepted, viewer);
  }

  /// Decline or withdraw — the row goes away either way. A decline (the
  /// addressee acting) leaves a history trail on both sides; a withdrawal
  /// (the requester canceling their own outgoing request) doesn't — there's
  /// nothing for the other side to see a history entry about.
  async withdraw(id: string, viewer: User): Promise<void> {
    const connection = await this.db.connection.findUnique({ where: { id } });
    if (
      !connection ||
      (connection.requesterId !== viewer.id &&
        connection.addresseeId !== viewer.id)
    ) {
      throw new NotFoundException(`Connection request ${id} not found`);
    }
    if (connection.status === ConnectionStatus.ACCEPTED) {
      throw new BadRequestException(
        'Already connected — use disconnect instead',
      );
    }

    const isDecline = connection.addresseeId === viewer.id;

    await this.db.$transaction(async (tx) => {
      await tx.connection.delete({ where: { id } });
      await this.notifications.discardForSubject(
        tx,
        NotificationType.CONNECTION_REQUEST,
        id,
      );
      if (isDecline) {
        await this.notifications.emit(tx, {
          recipientId: viewer.id,
          actorId: connection.requesterId,
          type: NotificationType.CONNECTION_REJECTED_BY_YOU,
          subjectId: id,
          read: true,
        });
        await this.notifications.emit(tx, {
          recipientId: connection.requesterId,
          actorId: viewer.id,
          type: NotificationType.CONNECTION_REJECTED,
          subjectId: id,
        });
      }
    });

    await this.invalidateFor(connection.requesterId, connection.addresseeId);
  }

  /// Withdraws or declines whichever pending request exists between the two
  /// accounts, without the caller needing to know its id.
  async withdrawWith(otherUserId: string, viewer: User): Promise<void> {
    const connection = await this.db.connection.findFirst({
      where: {
        status: ConnectionStatus.PENDING,
        OR: [
          { requesterId: viewer.id, addresseeId: otherUserId },
          { requesterId: otherUserId, addresseeId: viewer.id },
        ],
      },
      select: { id: true },
    });
    if (!connection) {
      throw new NotFoundException('There is no pending request');
    }
    await this.withdraw(connection.id, viewer);
  }

  /// This is what makes FRIENDS_ONLY visibility revocable.
  async disconnect(otherUserId: string, viewer: User): Promise<void> {
    const connection = await this.db.connection.findFirst({
      where: {
        status: ConnectionStatus.ACCEPTED,
        OR: [
          { requesterId: viewer.id, addresseeId: otherUserId },
          { requesterId: otherUserId, addresseeId: viewer.id },
        ],
      },
    });
    if (!connection) {
      throw new NotFoundException('You are not connected with that account');
    }

    await this.db.$transaction(async (tx) => {
      await tx.connection.delete({ where: { id: connection.id } });
      await this.notifications.discardForSubject(
        tx,
        NotificationType.CONNECTION_REQUEST,
        connection.id,
      );
      await this.notifications.discardForSubject(
        tx,
        NotificationType.CONNECTION_ACCEPTED,
        connection.id,
      );
      await this.notifications.discardForSubject(
        tx,
        NotificationType.CONNECTION_ACCEPTED_BY_YOU,
        connection.id,
      );
    });

    await this.invalidateFor(viewer.id, otherUserId);
  }

  /// Accepted outright, no request step: used when claiming an entry someone
  /// else added, where they already know you. The caller invalidates both
  /// users afterwards, since this transaction may still roll back.
  async linkAccepted(
    tx: PrismaTransactionClient,
    userId: string,
    otherUserId: string,
  ): Promise<void> {
    if (userId === otherUserId) return;

    const existing = await tx.connection.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: otherUserId },
          { requesterId: otherUserId, addresseeId: userId },
        ],
      },
      select: { id: true, status: true },
    });

    if (!existing) {
      await tx.connection.create({
        data: {
          requesterId: otherUserId,
          addresseeId: userId,
          status: ConnectionStatus.ACCEPTED,
          respondedAt: new Date(),
        },
      });
      return;
    }

    if (existing.status === ConnectionStatus.PENDING) {
      await tx.connection.update({
        where: { id: existing.id },
        data: { status: ConnectionStatus.ACCEPTED, respondedAt: new Date() },
      });
    }
  }
}

function toConnectionDto(
  connection: ConnectionWithUsers,
  viewer: User,
): ConnectionDto {
  const isOutgoing = connection.requesterId === viewer.id;
  const other = isOutgoing ? connection.addressee : connection.requester;

  let state: ConnectionState;
  if (connection.status === ConnectionStatus.ACCEPTED) {
    state = 'ACCEPTED';
  } else {
    state = isOutgoing ? 'PENDING_OUTGOING' : 'PENDING_INCOMING';
  }

  return {
    id: connection.id,
    user: toPublicUserDto(other),
    state,
    createdAt: connection.createdAt.toISOString(),
    respondedAt: connection.respondedAt?.toISOString() ?? null,
  };
}
