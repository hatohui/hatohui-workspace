import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Database } from '@/libs/db';
import { FriendVisibility, OnboardingStatus, type User } from '@prisma/client';
import { ConnectionsService } from '@/modules/connections/connections.service';
import { FriendsService } from '../friends/friends.service';
import { generateUniqueHandle } from '../users/handle.util';
import {
  AddConnectionsDto,
  OnboardingStateDto,
  OptInDto,
  SetBirthdayDto,
  SetProfileDto,
  SetVisibilityDto,
} from './dto/onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly db: Database,
    private readonly friendsService: FriendsService,
    private readonly connections: ConnectionsService,
  ) {}

  async getState(viewer: User): Promise<OnboardingStateDto> {
    const association = await this.db.association.findUnique({
      where: { userId: viewer.id },
    });
    const entry = association
      ? await this.friendsService.findOne(association.birthdayDetailsId, viewer)
      : null;
    return { onboardingStatus: viewer.onboardingStatus, entry };
  }

  async optIn(dto: OptInDto, viewer: User): Promise<OnboardingStateDto> {
    if (!dto.join) {
      await this.ensureHandleAssigned(viewer);
      await this.db.user.update({
        where: { id: viewer.id },
        data: { onboardingStatus: OnboardingStatus.SKIPPED },
      });
      return { onboardingStatus: OnboardingStatus.SKIPPED, entry: null };
    }

    const existing = await this.db.association.findUnique({
      where: { userId: viewer.id },
    });
    const birthdayDetailsId =
      existing?.birthdayDetailsId ?? (await this.createOwnEntry(viewer)).id;

    const entry = await this.friendsService.findOne(birthdayDetailsId, viewer);
    return { onboardingStatus: viewer.onboardingStatus, entry };
  }

  async setProfile(
    dto: SetProfileDto,
    viewer: User,
  ): Promise<OnboardingStateDto> {
    const id = await this.getOwnEntryIdOrThrow(viewer);
    const entry = await this.friendsService.update(
      id,
      { name: dto.name, avatarKey: dto.avatarKey },
      viewer,
    );
    return { onboardingStatus: viewer.onboardingStatus, entry };
  }

  async setVisibility(
    dto: SetVisibilityDto,
    viewer: User,
  ): Promise<OnboardingStateDto> {
    const id = await this.getOwnEntryIdOrThrow(viewer);
    await this.db.birthdayDetails.update({
      where: { id },
      data: { visibility: dto.visibility },
    });
    const entry = await this.friendsService.findOne(id, viewer);
    return { onboardingStatus: viewer.onboardingStatus, entry };
  }

  async setBirthday(
    dto: SetBirthdayDto,
    viewer: User,
  ): Promise<OnboardingStateDto> {
    const id = await this.getOwnEntryIdOrThrow(viewer);
    const current = await this.db.birthdayDetails.findUniqueOrThrow({
      where: { id },
    });
    if (current.visibility === FriendVisibility.NONE) {
      throw new BadRequestException(
        'Birthday is not collected when visibility is set to None',
      );
    }
    await this.db.birthdayDetails.update({
      where: { id },
      data: {
        birthYear: dto.birthYear ?? null,
        birthMonth: dto.birthMonth,
        birthDay: dto.birthDay,
      },
    });
    const entry = await this.friendsService.findOne(id, viewer);
    return { onboardingStatus: viewer.onboardingStatus, entry };
  }

  /// Fans out connection requests to the accounts picked during onboarding.
  /// Each one goes through ConnectionsService so it gets the same validation
  /// and notification as a request sent from a profile page; already-pending
  /// or already-connected picks are simply skipped rather than failing the
  /// whole step.
  async addConnections(dto: AddConnectionsDto, viewer: User): Promise<void> {
    for (const userId of dto.userIds) {
      try {
        await this.connections.request(userId, viewer);
      } catch (error) {
        if (
          error instanceof ConflictException ||
          error instanceof BadRequestException ||
          error instanceof NotFoundException
        ) {
          continue;
        }
        throw error;
      }
    }
  }

  async complete(viewer: User): Promise<OnboardingStateDto> {
    await this.getOwnEntryIdOrThrow(viewer);
    await this.ensureHandleAssigned(viewer);
    const updated = await this.db.user.update({
      where: { id: viewer.id },
      data: { onboardingStatus: OnboardingStatus.COMPLETED },
    });
    return this.getState(updated);
  }

  async skip(viewer: User): Promise<OnboardingStateDto> {
    await this.ensureHandleAssigned(viewer);
    const updated = await this.db.user.update({
      where: { id: viewer.id },
      data: { onboardingStatus: OnboardingStatus.SKIPPED },
    });
    return this.getState(updated);
  }

  /// Every path out of onboarding (complete, skip, or declining the opt-in
  /// entirely) must leave the user with a handle — the handle step itself is
  /// optional, so this is the backstop that auto-generates one from their
  /// name if they never set it.
  private async ensureHandleAssigned(viewer: User): Promise<void> {
    if (viewer.handle) return;
    const handle = await generateUniqueHandle(this.db, viewer.name);
    await this.db.user.update({
      where: { id: viewer.id },
      data: { handle },
    });
  }

  private async createOwnEntry(viewer: User) {
    const entry = await this.db.birthdayDetails.create({
      data: {
        name: viewer.name,
        avatarUrl: viewer.avatarUrl,
        addedById: viewer.id,
        visibility: FriendVisibility.PUBLIC,
        preferAnonymous: true,
      },
    });
    await this.db.association.create({
      data: { userId: viewer.id, birthdayDetailsId: entry.id },
    });
    return entry;
  }

  private async getOwnEntryIdOrThrow(viewer: User): Promise<string> {
    const association = await this.db.association.findUnique({
      where: { userId: viewer.id },
    });
    if (!association) {
      throw new BadRequestException('Complete the opt-in step first');
    }
    return association.birthdayDetailsId;
  }
}
