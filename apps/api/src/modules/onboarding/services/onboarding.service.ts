import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Database } from '@/infra/db';
import { Cache, CACHE_KEYS } from '@/infra/cache';
import { FriendVisibility, OnboardingStatus, type User } from '@prisma/client';
import { ConnectionsService } from '@/modules/connections/services/connections.service';
import { ProfilesService } from '@/modules/profiles/services/profiles.service';
import { generateUniqueHandle } from '@/modules/users/utils/handle.util';
import {
  AddConnectionsDto,
  OnboardingStateDto,
  OptInDto,
  SetBirthdayDto,
  SetProfileDto,
  SetVisibilityDto,
} from '@/modules/onboarding/dto/onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly db: Database,
    private readonly cache: Cache,
    private readonly profiles: ProfilesService,
    private readonly connections: ConnectionsService,
  ) {}

  async getState(viewer: User): Promise<OnboardingStateDto> {
    const profile = await this.findOwnProfile(viewer);
    const entry = profile
      ? await this.profiles.findOne(profile.id, viewer)
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

    const existing = await this.findOwnProfile(viewer);
    const profileId = existing?.id ?? (await this.createOwnProfile(viewer)).id;

    const entry = await this.profiles.findOne(profileId, viewer);
    return { onboardingStatus: viewer.onboardingStatus, entry };
  }

  async setProfile(
    dto: SetProfileDto,
    viewer: User,
  ): Promise<OnboardingStateDto> {
    const id = await this.getOwnProfileIdOrThrow(viewer);
    const entry = await this.profiles.update(
      id,
      { name: dto.name, avatarKey: dto.avatarKey },
      viewer,
    );
    return { onboardingStatus: viewer.onboardingStatus, entry };
  }

  /// Visibility belongs to the birthday, which may not exist yet at this step
  /// — choosing NONE is therefore expressed by having no birthday at all, and
  /// any other choice is carried into `setBirthday`.
  async setVisibility(
    dto: SetVisibilityDto,
    viewer: User,
  ): Promise<OnboardingStateDto> {
    const id = await this.getOwnProfileIdOrThrow(viewer);

    if (dto.visibility === FriendVisibility.NONE) {
      await this.db.birthday.deleteMany({ where: { profileId: id } });
    } else {
      await this.db.birthday.updateMany({
        where: { profileId: id },
        data: { visibility: dto.visibility },
      });
    }

    const entry = await this.profiles.findOne(id, viewer);
    return { onboardingStatus: viewer.onboardingStatus, entry };
  }

  async setBirthday(
    dto: SetBirthdayDto,
    viewer: User,
  ): Promise<OnboardingStateDto> {
    const id = await this.getOwnProfileIdOrThrow(viewer);
    const visibility = dto.visibility ?? FriendVisibility.PUBLIC;

    await this.db.birthday.upsert({
      where: { profileId: id },
      create: {
        profileId: id,
        year: dto.birthYear ?? null,
        month: dto.birthMonth,
        day: dto.birthDay,
        visibility,
      },
      update: {
        year: dto.birthYear ?? null,
        month: dto.birthMonth,
        day: dto.birthDay,
        visibility,
      },
    });

    const entry = await this.profiles.findOne(id, viewer);
    return { onboardingStatus: viewer.onboardingStatus, entry };
  }

  /// Fans out connection requests to the accounts picked during onboarding.
  /// Already-pending or already-connected picks are skipped rather than
  /// failing the whole step.
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
    await this.getOwnProfileIdOrThrow(viewer);
    await this.ensureHandleAssigned(viewer);
    const updated = await this.db.user.update({
      where: { id: viewer.id },
      data: { onboardingStatus: OnboardingStatus.COMPLETED },
    });
    await this.cache.invalidate(CACHE_KEYS.birthdaysList());
    return this.getState(updated);
  }

  async skip(viewer: User): Promise<OnboardingStateDto> {
    await this.ensureHandleAssigned(viewer);
    const updated = await this.db.user.update({
      where: { id: viewer.id },
      data: { onboardingStatus: OnboardingStatus.SKIPPED },
    });
    await this.cache.invalidate(CACHE_KEYS.birthdaysList());
    return this.getState(updated);
  }

  /// The handle step is optional, so this is the backstop that generates one
  /// from their name if they never set it. A user who never opted in has no
  /// profile to name, and needs no handle.
  private async ensureHandleAssigned(viewer: User): Promise<void> {
    const profile = await this.db.profile.findUnique({
      where: { userId: viewer.id },
      select: { id: true, handle: true },
    });
    if (!profile || profile.handle) return;

    const handle = await generateUniqueHandle(this.db, viewer.name);
    await this.db.profile.update({
      where: { id: profile.id },
      data: { handle },
    });
  }

  /// Claimed at creation: the account is opting itself in, so there is no
  /// separate claim step to wait for.
  private createOwnProfile(viewer: User) {
    return this.db.profile.create({
      data: {
        displayName: viewer.name,
        avatarUrl: viewer.avatarUrl,
        addedById: viewer.id,
        userId: viewer.id,
      },
    });
  }

  private findOwnProfile(viewer: User) {
    return this.db.profile.findUnique({
      where: { userId: viewer.id },
      select: { id: true },
    });
  }

  private async getOwnProfileIdOrThrow(viewer: User): Promise<string> {
    const profile = await this.findOwnProfile(viewer);
    if (!profile) {
      throw new BadRequestException('Complete the opt-in step first');
    }
    return profile.id;
  }
}
