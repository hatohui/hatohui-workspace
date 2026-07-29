import { BadRequestException, Injectable } from '@nestjs/common';
import { Database } from '@/libs/db';
import { FriendVisibility, OnboardingStatus, type User } from '@prisma/client';
import { FriendsService } from '../friends/friends.service';
import {
  AddConnectionsDto,
  OnboardingStateDto,
  OptInDto,
  SetBirthdayDto,
  SetVisibilityDto,
} from './dto/onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly db: Database,
    private readonly friendsService: FriendsService,
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

  async addConnections(dto: AddConnectionsDto, viewer: User): Promise<void> {
    await this.db.connection.createMany({
      data: dto.birthdayDetailsIds.map((birthdayDetailsId) => ({
        userId: viewer.id,
        birthdayDetailsId,
      })),
      skipDuplicates: true,
    });
  }

  async complete(viewer: User): Promise<OnboardingStateDto> {
    await this.getOwnEntryIdOrThrow(viewer);
    const updated = await this.db.user.update({
      where: { id: viewer.id },
      data: { onboardingStatus: OnboardingStatus.COMPLETED },
    });
    return this.getState(updated);
  }

  async skip(viewer: User): Promise<OnboardingStateDto> {
    const updated = await this.db.user.update({
      where: { id: viewer.id },
      data: { onboardingStatus: OnboardingStatus.SKIPPED },
    });
    return this.getState(updated);
  }

  private async createOwnEntry(viewer: User) {
    const entry = await this.db.birthdayDetails.create({
      data: {
        name: viewer.name,
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
