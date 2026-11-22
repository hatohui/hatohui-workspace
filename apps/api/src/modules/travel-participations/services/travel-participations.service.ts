import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AppScope,
  NotificationType,
  Prisma,
  TravelJoinRequestStatus,
  TravelLeaveType,
} from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import { StorageCleanupService } from '@/modules/storage-cleanup/services/storage-cleanup.service';
import {
  DEFAULT_ADMIN_GROUPS_LIMIT,
  DEFAULT_GROUP_NAME,
} from '@/modules/travel-participations/travel-participations.constants';
import {
  AcceptTravelInviteDto,
  CreateTravelParticipationDto,
  TravelAdminGroupsQueryDto,
  TravelAdminGroupsResponseDto,
  TravelAdminStatsDto,
  TravelJoinRequestDto,
  TravelParticipantMemberDto,
  TravelParticipationDetailDto,
  TravelParticipationDto,
  TravelParticipationEventDto,
  TravelParticipationGroupDto,
  TravelParticipationQueryDto,
  TravelSharePlanDto,
  UpdateTravelGroupSettingsDto,
  UpdateTravelParticipationDatesDto,
} from '@/modules/travel-participations/dto/travel-participation.dto';

const MEMBER_USER_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
  profile: {
    select: {
      displayName: true,
      handle: true,
      avatarUrl: true,
    },
  },
} as const;

type MemberUserRow = {
  id: string;
  name: string;
  avatarUrl: string | null;
  profile: {
    displayName: string;
    handle: string | null;
    avatarUrl: string | null;
  } | null;
};

@Injectable()
export class TravelParticipationsService {
  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly storageCleanup: StorageCleanupService,
  ) {}

  async listMine(
    userId: string,
    query: TravelParticipationQueryDto,
  ): Promise<TravelParticipationDto[]> {
    const rows = await this.db.travelParticipation.findMany({
      where: {
        userId,
        ...(query.from ? { to: { gte: new Date(query.from) } } : {}),
        ...(query.to ? { from: { lte: new Date(query.to) } } : {}),
      },
      include: {
        event: true,
        group: { include: { _count: { select: { participations: true } } } },
      },
      orderBy: { from: 'asc' },
    });

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      eventId: row.eventId,
      groupId: row.groupId,
      from: row.from.toISOString(),
      to: row.to.toISOString(),
      leaveType: row.leaveType,
      isAlreadyHere: row.isAlreadyHere,
      entryFlight: row.entryFlight,
      exitFlight: row.exitFlight,
      event: row.event ? this.toEventDto(row.event) : null,
      group: row.group
        ? this.toGroupDto(row.group, row.group._count.participations)
        : null,
    }));
  }

  async getDetail(
    id: string,
    viewerId?: string,
  ): Promise<TravelParticipationDetailDto> {
    const participation = await this.db.travelParticipation.findUnique({
      where: { id },
      include: {
        event: true,
        group: true,
      },
    });
    if (!participation) {
      throw new NotFoundException('Travel plan not found');
    }

    const group =
      participation.group ??
      (await this.ensureGroupForParticipation(
        participation.id,
        participation.userId,
        participation.eventId,
      ));

    const memberRows = await this.db.travelParticipation.findMany({
      where: { groupId: group.id },
      include: { user: { select: MEMBER_USER_SELECT } },
      orderBy: { createdAt: 'asc' },
    });

    const isOwner = Boolean(viewerId && group.ownerId === viewerId);
    const isMember = Boolean(
      viewerId && memberRows.some((m) => m.userId === viewerId),
    );

    if (!isMember && !group.isPublic) {
      throw new ForbiddenException('This travel plan is private');
    }

    const showMembers = isMember || group.isMemberListPublicVisible;
    const participants: TravelParticipantMemberDto[] = showMembers
      ? memberRows.map((m) => this.toMemberDto(m))
      : [];

    const [myRequest, pendingJoinRequestsCount] = await Promise.all([
      viewerId && !isMember
        ? this.db.travelJoinRequest.findUnique({
            where: { groupId_userId: { groupId: group.id, userId: viewerId } },
            select: { status: true },
          })
        : Promise.resolve(null),
      isOwner
        ? this.db.travelJoinRequest.count({
            where: {
              groupId: group.id,
              status: TravelJoinRequestStatus.PENDING,
            },
          })
        : Promise.resolve(0),
    ]);

    return {
      id: participation.id,
      userId: participation.userId,
      from: participation.from.toISOString(),
      to: participation.to.toISOString(),
      leaveType: participation.leaveType,
      isAlreadyHere: participation.isAlreadyHere,
      entryFlight: participation.entryFlight,
      exitFlight: participation.exitFlight,
      isOwner,
      isMember,
      event: participation.event ? this.toEventDto(participation.event) : null,
      group: this.toGroupDto(group, memberRows.length),
      participants,
      myJoinRequestStatus: myRequest?.status ?? null,
      pendingJoinRequestsCount,
    };
  }

  async getShare(id: string): Promise<TravelSharePlanDto> {
    const participation = await this.db.travelParticipation.findUnique({
      where: { id },
      include: {
        user: { select: MEMBER_USER_SELECT },
        event: true,
        group: { include: { _count: { select: { participations: true } } } },
      },
    });
    if (!participation || !participation.group?.isPublic) {
      throw new NotFoundException('Public travel plan not found');
    }

    const eventImageUrl = participation.event?.previewKey
      ? this.storage.getPublicUrl(participation.event.previewKey)
      : participation.event?.imageKey
        ? this.storage.getPublicUrl(participation.event.imageKey)
        : null;

    return {
      id: participation.id,
      from: participation.from.toISOString(),
      to: participation.to.toISOString(),
      leaveType: participation.leaveType,
      groupName: participation.group.name,
      memberCount: participation.group._count.participations,
      sharerName:
        participation.user.profile?.displayName ?? participation.user.name,
      sharerAvatarUrl:
        participation.user.profile?.avatarUrl ?? participation.user.avatarUrl,
      eventTitle: participation.event?.title ?? null,
      eventDescription: participation.event?.description ?? null,
      eventImageUrl,
      eventLocation: participation.event?.location ?? null,
    };
  }

  async create(
    userId: string,
    dto: CreateTravelParticipationDto,
  ): Promise<TravelParticipationDetailDto> {
    const from = new Date(dto.from);
    const to = new Date(dto.to);
    if (to <= from) {
      throw new BadRequestException('End date must be after start date');
    }

    await this.assertNoOverlap(userId, from, to);

    let defaultName = dto.groupName?.trim() || DEFAULT_GROUP_NAME;
    if (dto.eventId) {
      const event = await this.db.travelEvent.findFirst({
        where: { id: dto.eventId, isDeleted: false },
        select: { id: true, title: true },
      });
      if (!event) throw new NotFoundException('Event not found');
      if (!dto.groupName?.trim()) defaultName = event.title;
    }

    const group = await this.db.travelParticipationGroup.create({
      data: {
        eventId: dto.eventId ?? null,
        ownerId: userId,
        name: defaultName,
      },
    });

    const created = await this.db.travelParticipation.create({
      data: {
        userId,
        eventId: dto.eventId ?? null,
        groupId: group.id,
        from,
        to,
        leaveType: dto.leaveType,
        isAlreadyHere: dto.isAlreadyHere ?? false,
        entryFlight: dto.entryFlight?.trim() || null,
        exitFlight: dto.exitFlight?.trim() || null,
      },
    });

    const coTravelers = Array.from(new Set(dto.coTravelerIds ?? [])).filter(
      (uid) => uid !== userId,
    );
    for (const targetUserId of coTravelers) {
      const overlap = await this.findOverlapping(targetUserId, from, to);
      if (overlap) continue;
      await this.db.travelParticipation.create({
        data: {
          userId: targetUserId,
          eventId: dto.eventId ?? null,
          groupId: group.id,
          from,
          to,
          leaveType: dto.leaveType,
          createdById: userId,
        },
      });
    }

    return this.getDetail(created.id, userId);
  }

  async updateDates(
    id: string,
    actorId: string,
    dto: UpdateTravelParticipationDatesDto,
  ): Promise<TravelParticipationDetailDto> {
    const target = await this.db.travelParticipation.findUnique({
      where: { id },
      include: { group: true },
    });
    if (!target) throw new NotFoundException('Travel plan not found');

    const isOwner = target.group?.ownerId === actorId;
    if (target.userId !== actorId && !isOwner) {
      throw new ForbiddenException('Not allowed to edit these dates');
    }

    const from = dto.from ? new Date(dto.from) : target.from;
    const to = dto.to ? new Date(dto.to) : target.to;
    if (to <= from) {
      throw new BadRequestException('End date must be after start date');
    }

    await this.assertNoOverlap(target.userId, from, to, target.id);

    await this.db.travelParticipation.update({
      where: { id: target.id },
      data: {
        from,
        to,
        ...(dto.leaveType !== undefined ? { leaveType: dto.leaveType } : {}),
        ...(dto.isAlreadyHere !== undefined
          ? { isAlreadyHere: dto.isAlreadyHere }
          : {}),
        ...(dto.entryFlight !== undefined
          ? { entryFlight: dto.entryFlight?.trim() || null }
          : {}),
        ...(dto.exitFlight !== undefined
          ? { exitFlight: dto.exitFlight?.trim() || null }
          : {}),
      },
    });

    return this.getDetail(target.id, actorId);
  }

  async updateGroupSettings(
    participationId: string,
    actorId: string,
    dto: UpdateTravelGroupSettingsDto,
  ): Promise<TravelParticipationGroupDto> {
    const group = await this.requireOwnedGroup(participationId, actorId);

    const updated = await this.db.travelParticipationGroup.update({
      where: { id: group.id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.isMemberInviteAllowed !== undefined
          ? { isMemberInviteAllowed: dto.isMemberInviteAllowed }
          : {}),
        ...(dto.isPublic !== undefined ? { isPublic: dto.isPublic } : {}),
        ...(dto.isActivityPublicVisible !== undefined
          ? { isActivityPublicVisible: dto.isActivityPublicVisible }
          : {}),
        ...(dto.isMemberListPublicVisible !== undefined
          ? { isMemberListPublicVisible: dto.isMemberListPublicVisible }
          : {}),
        ...(dto.isMediaPublicVisible !== undefined
          ? { isMediaPublicVisible: dto.isMediaPublicVisible }
          : {}),
      },
      include: { _count: { select: { participations: true } } },
    });

    return this.toGroupDto(updated, updated._count.participations);
  }

  async inviteMember(
    participationId: string,
    actorId: string,
    targetUserId: string,
  ): Promise<void> {
    const { group } = await this.loadParticipationAndGroup(participationId);
    const isMember = await this.isGroupMember(group.id, actorId);
    if (!isMember) throw new ForbiddenException('Not a group member');
    if (group.ownerId !== actorId && !group.isMemberInviteAllowed) {
      throw new ForbiddenException('Only the group owner can invite members');
    }

    const alreadyIn = await this.isGroupMember(group.id, targetUserId);
    if (alreadyIn) {
      throw new ConflictException('User is already in this group');
    }

    await this.notify(
      targetUserId,
      actorId,
      NotificationType.TRAVEL_INVITED_TO_JOIN,
      {
        groupId: group.id,
        groupName: group.name,
        participationId,
        eventId: group.eventId,
      },
    );
  }

  async acceptInvite(
    participationId: string,
    userId: string,
    dto: AcceptTravelInviteDto,
  ): Promise<TravelParticipationDetailDto> {
    const { group } = await this.loadParticipationAndGroup(participationId);
    const from = new Date(dto.from);
    const to = new Date(dto.to);
    if (to <= from) {
      throw new BadRequestException('End date must be after start date');
    }

    const existing = await this.db.travelParticipation.findFirst({
      where: { groupId: group.id, userId },
      select: { id: true },
    });
    if (existing) {
      return this.getDetail(existing.id, userId);
    }

    await this.assertNoOverlap(userId, from, to);

    const created = await this.db.travelParticipation.create({
      data: {
        userId,
        eventId: group.eventId,
        groupId: group.id,
        from,
        to,
        leaveType: dto.leaveType,
        isAlreadyHere: dto.isAlreadyHere ?? false,
        entryFlight: dto.entryFlight?.trim() || null,
        exitFlight: dto.exitFlight?.trim() || null,
      },
    });

    if (group.ownerId !== userId) {
      await this.notify(
        group.ownerId,
        userId,
        NotificationType.TRAVEL_INVITE_ACCEPTED,
        { groupId: group.id, groupName: group.name, participationId },
      );
    }

    return this.getDetail(created.id, userId);
  }

  async declineInvite(participationId: string, userId: string): Promise<void> {
    const { group } = await this.loadParticipationAndGroup(participationId);
    if (group.ownerId !== userId) {
      await this.notify(
        group.ownerId,
        userId,
        NotificationType.TRAVEL_INVITE_DECLINED,
        { groupId: group.id, groupName: group.name, participationId },
      );
    }
  }

  async requestJoin(
    participationId: string,
    userId: string,
  ): Promise<TravelJoinRequestDto> {
    const { group } = await this.loadParticipationAndGroup(participationId);
    if (!group.isPublic) {
      throw new ForbiddenException('Group is private');
    }
    if (await this.isGroupMember(group.id, userId)) {
      throw new ConflictException('Already a member of this group');
    }

    const row = await this.db.travelJoinRequest.upsert({
      where: { groupId_userId: { groupId: group.id, userId } },
      create: {
        groupId: group.id,
        userId,
        status: TravelJoinRequestStatus.PENDING,
      },
      update: { status: TravelJoinRequestStatus.PENDING },
      include: { user: { select: MEMBER_USER_SELECT } },
    });

    await this.notify(
      group.ownerId,
      userId,
      NotificationType.TRAVEL_JOIN_REQUEST,
      {
        groupId: group.id,
        groupName: group.name,
        participationId,
        requestId: row.id,
      },
    );

    return this.toJoinRequestDto(row);
  }

  async listJoinRequests(
    participationId: string,
    actorId: string,
  ): Promise<TravelJoinRequestDto[]> {
    const group = await this.requireOwnedGroup(participationId, actorId);
    const rows = await this.db.travelJoinRequest.findMany({
      where: { groupId: group.id, status: TravelJoinRequestStatus.PENDING },
      include: { user: { select: MEMBER_USER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toJoinRequestDto(row));
  }

  async approveJoinRequest(
    participationId: string,
    requestId: string,
    actorId: string,
  ): Promise<void> {
    const group = await this.requireOwnedGroup(participationId, actorId);
    const request = await this.db.travelJoinRequest.findFirst({
      where: { id: requestId, groupId: group.id },
    });
    if (!request) throw new NotFoundException('Join request not found');

    const ownerParticipation = await this.db.travelParticipation.findFirst({
      where: { groupId: group.id, userId: group.ownerId },
      select: { from: true, to: true },
    });
    const fallbackFrom = ownerParticipation?.from ?? new Date();
    const fallbackTo =
      ownerParticipation?.to ??
      new Date(fallbackFrom.getTime() + 24 * 60 * 60 * 1000);

    await this.assertNoOverlap(request.userId, fallbackFrom, fallbackTo);

    await this.db.travelJoinRequest.update({
      where: { id: request.id },
      data: { status: TravelJoinRequestStatus.APPROVED },
    });

    await this.db.travelParticipation.create({
      data: {
        userId: request.userId,
        eventId: group.eventId,
        groupId: group.id,
        from: fallbackFrom,
        to: fallbackTo,
        leaveType: TravelLeaveType.ANNUAL,
        createdById: actorId,
      },
    });

    await this.notify(
      request.userId,
      actorId,
      NotificationType.TRAVEL_JOIN_REQUEST_APPROVED,
      { groupId: group.id, groupName: group.name, participationId },
    );
  }

  async rejectJoinRequest(
    participationId: string,
    requestId: string,
    actorId: string,
  ): Promise<void> {
    const group = await this.requireOwnedGroup(participationId, actorId);
    const request = await this.db.travelJoinRequest.findFirst({
      where: { id: requestId, groupId: group.id },
    });
    if (!request) throw new NotFoundException('Join request not found');

    await this.db.travelJoinRequest.update({
      where: { id: request.id },
      data: { status: TravelJoinRequestStatus.REJECTED },
    });

    await this.notify(
      request.userId,
      actorId,
      NotificationType.TRAVEL_JOIN_REQUEST_REJECTED,
      { groupId: group.id, groupName: group.name, participationId },
    );
  }

  async kickMember(
    participationId: string,
    actorId: string,
    targetUserId: string,
  ): Promise<void> {
    const group = await this.requireOwnedGroup(participationId, actorId);
    if (targetUserId === actorId) {
      throw new BadRequestException('Cannot kick yourself; use leave instead');
    }

    const target = await this.db.travelParticipation.findFirst({
      where: { groupId: group.id, userId: targetUserId },
      select: { id: true },
    });
    if (!target) throw new NotFoundException('Member not found in group');

    await this.cleanupMemberContributions(group.id, targetUserId);
    await this.db.travelParticipation.delete({ where: { id: target.id } });

    await this.notify(
      targetUserId,
      actorId,
      NotificationType.TRAVEL_USER_KICKED,
      { groupId: group.id, groupName: group.name },
    );
  }

  async leaveGroup(participationId: string, userId: string): Promise<void> {
    const { group } = await this.loadParticipationAndGroup(participationId);
    const myParticipation = await this.db.travelParticipation.findFirst({
      where: { groupId: group.id, userId },
      select: { id: true },
    });
    if (!myParticipation) {
      throw new ForbiddenException('You are not a member of this group');
    }

    const remaining = await this.db.travelParticipation.findMany({
      where: { groupId: group.id, userId: { not: userId } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, userId: true },
    });

    if (remaining.length === 0) {
      await this.deleteGroupAndStorage(group.id);
      return;
    }

    await this.cleanupMemberContributions(group.id, userId);
    await this.db.travelParticipation.delete({
      where: { id: myParticipation.id },
    });

    if (group.ownerId === userId) {
      const nextOwner = remaining[0];
      await this.db.travelParticipationGroup.update({
        where: { id: group.id },
        data: { ownerId: nextOwner.userId },
      });
      await this.notify(
        nextOwner.userId,
        userId,
        NotificationType.TRAVEL_GROUP_PROMOTION,
        {
          groupId: group.id,
          groupName: group.name,
          participationId: nextOwner.id,
        },
      );
    } else {
      await this.notify(
        group.ownerId,
        userId,
        NotificationType.TRAVEL_USER_LEFT,
        { groupId: group.id, groupName: group.name, participationId },
      );
    }
  }

  async transferOwnership(
    participationId: string,
    actorId: string,
    newOwnerId: string,
  ): Promise<void> {
    const group = await this.requireOwnedGroup(participationId, actorId);
    if (newOwnerId === actorId) return;

    const target = await this.db.travelParticipation.findFirst({
      where: { groupId: group.id, userId: newOwnerId },
      select: { id: true },
    });
    if (!target) {
      throw new BadRequestException('New owner must be a member of the group');
    }

    await this.db.travelParticipationGroup.update({
      where: { id: group.id },
      data: { ownerId: newOwnerId },
    });

    await this.notify(
      newOwnerId,
      actorId,
      NotificationType.TRAVEL_OWNERSHIP_TRANSFERRED,
      { groupId: group.id, groupName: group.name, participationId: target.id },
    );
  }

  async deleteGroup(participationId: string, actorId: string): Promise<void> {
    const group = await this.requireOwnedGroup(participationId, actorId);
    const members = await this.db.travelParticipation.findMany({
      where: { groupId: group.id, userId: { not: actorId } },
      select: { userId: true },
    });

    await this.deleteGroupAndStorage(group.id);

    await Promise.all(
      members.map((m) =>
        this.notify(m.userId, actorId, NotificationType.TRAVEL_PLAN_DELETED, {
          groupId: group.id,
          groupName: group.name,
        }),
      ),
    );
  }

  async listGroupsAdmin(
    query: TravelAdminGroupsQueryDto,
  ): Promise<TravelAdminGroupsResponseDto> {
    const q = query.q?.trim();
    const where: Prisma.TravelParticipationGroupWhereInput = {
      ...(query.eventId ? { eventId: query.eventId } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { event: { title: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [total, groups] = await Promise.all([
      this.db.travelParticipationGroup.count({ where }),
      this.db.travelParticipationGroup.findMany({
        where,
        include: {
          event: { select: { title: true } },
          _count: {
            select: { participations: true, activities: true, images: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip ?? 0,
        take: query.take ?? DEFAULT_ADMIN_GROUPS_LIMIT,
      }),
    ]);

    return {
      total,
      groups: groups.map((g) => ({
        id: g.id,
        name: g.name,
        ownerId: g.ownerId,
        isPublic: g.isPublic,
        eventTitle: g.event?.title ?? null,
        memberCount: g._count.participations,
        activityCount: g._count.activities,
        imageCount: g._count.images,
        createdAt: g.createdAt.toISOString(),
      })),
    };
  }

  async deleteGroupAdmin(groupId: string): Promise<void> {
    const exists = await this.db.travelParticipationGroup.findUnique({
      where: { id: groupId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Travel group not found');
    await this.deleteGroupAndStorage(groupId);
  }

  async getAdminStats(): Promise<TravelAdminStatsDto> {
    const [
      totalEvents,
      pendingEvents,
      totalGroups,
      totalParticipations,
      totalJobProfiles,
    ] = await Promise.all([
      this.db.travelEvent.count({ where: { isDeleted: false } }),
      this.db.travelEvent.count({
        where: { isDeleted: false, isApproved: false },
      }),
      this.db.travelParticipationGroup.count(),
      this.db.travelParticipation.count(),
      this.db.travelJobProfile.count(),
    ]);

    return {
      totalEvents,
      pendingEvents,
      totalGroups,
      totalParticipations,
      totalJobProfiles,
    };
  }

  private async ensureGroupForParticipation(
    participationId: string,
    ownerId: string,
    eventId: string | null,
  ) {
    const group = await this.db.travelParticipationGroup.create({
      data: { ownerId, eventId, name: DEFAULT_GROUP_NAME },
    });
    await this.db.travelParticipation.update({
      where: { id: participationId },
      data: { groupId: group.id },
    });
    return group;
  }

  private async loadParticipationAndGroup(participationId: string) {
    const participation = await this.db.travelParticipation.findUnique({
      where: { id: participationId },
      include: { group: true },
    });
    if (!participation) {
      throw new NotFoundException('Travel plan not found');
    }
    const group =
      participation.group ??
      (await this.ensureGroupForParticipation(
        participation.id,
        participation.userId,
        participation.eventId,
      ));
    return { participation, group };
  }

  private async requireOwnedGroup(participationId: string, actorId: string) {
    const { group } = await this.loadParticipationAndGroup(participationId);
    if (group.ownerId !== actorId) {
      throw new ForbiddenException('Only the group owner can do this');
    }
    return group;
  }

  private async isGroupMember(
    groupId: string,
    userId: string,
  ): Promise<boolean> {
    const row = await this.db.travelParticipation.findFirst({
      where: { groupId, userId },
      select: { id: true },
    });
    return row !== null;
  }

  private async findOverlapping(
    userId: string,
    from: Date,
    to: Date,
    excludeId?: string,
  ) {
    return this.db.travelParticipation.findFirst({
      where: {
        userId,
        ...(excludeId ? { id: { not: excludeId } } : {}),
        from: { lt: to },
        to: { gt: from },
      },
      select: { id: true },
    });
  }

  private async assertNoOverlap(
    userId: string,
    from: Date,
    to: Date,
    excludeId?: string,
  ): Promise<void> {
    const overlap = await this.findOverlapping(userId, from, to, excludeId);
    if (overlap) {
      throw new ConflictException(
        'Travel dates overlap with an existing travel plan',
      );
    }
  }

  private async cleanupMemberContributions(
    groupId: string,
    userId: string,
  ): Promise<void> {
    const [groupImages, activityMedia, taggedActivities] = await Promise.all([
      this.db.travelGroupImage.findMany({
        where: { groupId, uploadedById: userId },
        select: { key: true, thumbnailKey: true, previewKey: true },
      }),
      this.db.travelActivityMedia.findMany({
        where: { uploadedById: userId, activity: { groupId } },
        select: { id: true, key: true, thumbnailKey: true, previewKey: true },
      }),
      this.db.travelActivity.findMany({
        where: {
          groupId,
          isExcludeMode: false,
          involvedPeople: { has: userId },
        },
        select: {
          id: true,
          involvedPeople: true,
          imageKey: true,
          thumbnailKey: true,
          previewKey: true,
          media: {
            select: { key: true, thumbnailKey: true, previewKey: true },
          },
        },
      }),
    ]);

    const keysToDelete: string[] = [];
    const pushKey = (k: string | null | undefined) => {
      if (k) keysToDelete.push(k);
    };

    for (const img of groupImages) {
      pushKey(img.key);
      pushKey(img.thumbnailKey);
      pushKey(img.previewKey);
    }
    for (const media of activityMedia) {
      pushKey(media.key);
      pushKey(media.thumbnailKey);
      pushKey(media.previewKey);
    }

    const soloActivityIds: string[] = [];
    const multiActivityUpdates: Array<{
      id: string;
      involvedPeople: string[];
    }> = [];

    for (const act of taggedActivities) {
      if (act.involvedPeople.length <= 1) {
        soloActivityIds.push(act.id);
        pushKey(act.imageKey);
        pushKey(act.thumbnailKey);
        pushKey(act.previewKey);
        for (const m of act.media) {
          pushKey(m.key);
          pushKey(m.thumbnailKey);
          pushKey(m.previewKey);
        }
      } else {
        multiActivityUpdates.push({
          id: act.id,
          involvedPeople: act.involvedPeople.filter((uid) => uid !== userId),
        });
      }
    }

    await this.db.travelGroupImage.deleteMany({
      where: { groupId, uploadedById: userId },
    });
    if (activityMedia.length > 0) {
      await this.db.travelActivityMedia.deleteMany({
        where: { id: { in: activityMedia.map((m) => m.id) } },
      });
    }
    if (soloActivityIds.length > 0) {
      await this.db.travelActivity.deleteMany({
        where: { id: { in: soloActivityIds } },
      });
    }
    await Promise.all(
      multiActivityUpdates.map((item) =>
        this.db.travelActivity.update({
          where: { id: item.id },
          data: { involvedPeople: item.involvedPeople },
        }),
      ),
    );
    await Promise.all(
      Array.from(new Set(keysToDelete)).map((k) =>
        this.storageCleanup.delete(k),
      ),
    );
  }

  private async deleteGroupAndStorage(groupId: string): Promise<void> {
    const group = await this.db.travelParticipationGroup.findUnique({
      where: { id: groupId },
      select: {
        images: { select: { key: true, thumbnailKey: true, previewKey: true } },
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
    });

    const keys: string[] = [];
    const pushKey = (k: string | null | undefined) => {
      if (k) keys.push(k);
    };
    if (group) {
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

    await this.db.travelParticipation.deleteMany({ where: { groupId } });
    await this.db.travelParticipationGroup.delete({ where: { id: groupId } });
    await Promise.all(keys.map((k) => this.storageCleanup.delete(k)));
  }

  private async notify(
    recipientId: string,
    actorId: string,
    type: NotificationType,
    data: Prisma.InputJsonValue,
  ): Promise<void> {
    await this.db.notification.create({
      data: {
        recipientId,
        actorId,
        scope: AppScope.TRAVEL,
        type,
        subjectId: randomUUID(),
        data,
      },
    });
  }

  private toEventDto(event: {
    id: string;
    title: string;
    description: string | null;
    imageKey: string | null;
    thumbnailKey: string | null;
    startAt: Date;
    endAt: Date;
    location: string | null;
    mapsUrl: string | null;
    visibility: TravelParticipationEventDto['visibility'];
  }): TravelParticipationEventDto {
    const imageUrl = event.imageKey
      ? this.storage.getPublicUrl(event.imageKey)
      : null;
    const thumbnailUrl = event.thumbnailKey
      ? this.storage.getPublicUrl(event.thumbnailKey)
      : imageUrl;
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      thumbnailUrl,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt.toISOString(),
      location: event.location,
      mapsUrl: event.mapsUrl,
      visibility: event.visibility,
    };
  }

  private toGroupDto(
    group: {
      id: string;
      eventId: string | null;
      ownerId: string;
      name: string;
      isMemberInviteAllowed: boolean;
      isPublic: boolean;
      isActivityPublicVisible: boolean;
      isMemberListPublicVisible: boolean;
      isMediaPublicVisible: boolean;
      createdAt: Date;
    },
    memberCount: number,
  ): TravelParticipationGroupDto {
    return {
      id: group.id,
      eventId: group.eventId,
      ownerId: group.ownerId,
      name: group.name,
      isMemberInviteAllowed: group.isMemberInviteAllowed,
      isPublic: group.isPublic,
      isActivityPublicVisible: group.isActivityPublicVisible,
      isMemberListPublicVisible: group.isMemberListPublicVisible,
      isMediaPublicVisible: group.isMediaPublicVisible,
      memberCount,
      createdAt: group.createdAt.toISOString(),
    };
  }

  private toMemberDto(row: {
    id: string;
    userId: string;
    from: Date;
    to: Date;
    leaveType: TravelLeaveType;
    isAlreadyHere: boolean;
    entryFlight: string | null;
    exitFlight: string | null;
    createdById: string | null;
    user: MemberUserRow;
  }): TravelParticipantMemberDto {
    return {
      id: row.id,
      userId: row.userId,
      displayName: row.user.profile?.displayName ?? row.user.name,
      handle: row.user.profile?.handle ?? null,
      avatarUrl: row.user.profile?.avatarUrl ?? row.user.avatarUrl,
      from: row.from.toISOString(),
      to: row.to.toISOString(),
      leaveType: row.leaveType,
      isAlreadyHere: row.isAlreadyHere,
      entryFlight: row.entryFlight,
      exitFlight: row.exitFlight,
      createdById: row.createdById,
    };
  }

  private toJoinRequestDto(row: {
    id: string;
    groupId: string;
    userId: string;
    status: TravelJoinRequestStatus;
    createdAt: Date;
    user: MemberUserRow;
  }): TravelJoinRequestDto {
    return {
      id: row.id,
      groupId: row.groupId,
      userId: row.userId,
      displayName: row.user.profile?.displayName ?? row.user.name,
      handle: row.user.profile?.handle ?? null,
      avatarUrl: row.user.profile?.avatarUrl ?? row.user.avatarUrl,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
