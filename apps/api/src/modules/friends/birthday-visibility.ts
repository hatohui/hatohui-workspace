import { BadRequestException } from '@nestjs/common';
import { FriendVisibility, Prisma } from '@prisma/client';
import { circleOf, type ViewerContext } from './viewer-context';
import type { ProfileWithBirthday } from './profile.mapper';
import type { CreateFriendDto, UpdateFriendDto } from './dto/friend.dto';

/// An profile's "owner" for privacy purposes: the account it represents if
/// claimed, otherwise whoever added it.
function ownerIdOf(profile: ProfileWithBirthday): string | null {
  return profile.userId ?? profile.addedById;
}

export function birthdayVisibilityWhere(
  ctx: ViewerContext,
): Prisma.BirthdayWhereInput {
  const { viewer } = ctx;
  if (!viewer) return { visibility: FriendVisibility.PUBLIC };

  const circle = circleOf(ctx);
  return {
    OR: [
      { visibility: FriendVisibility.PUBLIC },
      {
        visibility: FriendVisibility.FRIENDS_ONLY,
        profile: {
          OR: [{ addedById: { in: circle } }, { userId: { in: circle } }],
        },
      },
      {
        visibility: FriendVisibility.NONE,
        profile: {
          OR: [{ addedById: viewer.id }, { userId: viewer.id }],
        },
      },
    ],
  };
}

/// In-memory mirror of `birthdayVisibilityWhere` — keep the two in step.
export function canViewBirthday(
  profile: ProfileWithBirthday,
  ctx: ViewerContext,
): boolean {
  if (!profile.birthday) return false;

  const { viewer } = ctx;
  switch (profile.birthday.visibility) {
    case FriendVisibility.PUBLIC:
      return true;
    case FriendVisibility.FRIENDS_ONLY: {
      if (!viewer) return false;
      const circle = circleOf(ctx);
      const owner = ownerIdOf(profile);
      return (
        (profile.addedById !== null && circle.includes(profile.addedById)) ||
        (owner !== null && circle.includes(owner))
      );
    }
    case FriendVisibility.NONE:
      return (
        viewer !== null &&
        (profile.addedById === viewer.id || profile.userId === viewer.id)
      );
  }
}

export function validateBirthdayInput(
  dto: CreateFriendDto | UpdateFriendDto,
): void {
  const { birthYear, birthMonth, birthDay } = dto;

  if (
    birthYear !== undefined &&
    birthMonth === undefined &&
    birthDay === undefined
  ) {
    throw new BadRequestException(
      'birthYear cannot be set without birthMonth and birthDay',
    );
  }

  const hasMonth = birthMonth !== undefined;
  const hasDay = birthDay !== undefined;
  if (hasMonth !== hasDay) {
    throw new BadRequestException(
      'birthMonth and birthDay must both be provided together',
    );
  }

  if (hasMonth && hasDay) {
    // 2000 is a leap year, so Feb 29 round-trips for month/day-only entries.
    const probe = new Date(2000, birthMonth - 1, birthDay);
    if (probe.getMonth() !== birthMonth - 1 || probe.getDate() !== birthDay) {
      throw new BadRequestException('birthMonth/birthDay is not a valid date');
    }
  }
}
