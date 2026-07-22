import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Database } from '@/libs/db';
import {
  CreateFriendDto,
  FriendDto,
  UpcomingFriendDto,
  UpdateFriendDto,
} from './dto/friend.dto';
import type { Friend } from '@prisma/client';

@Injectable()
export class FriendsService {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<FriendDto[]> {
    const friends = await this.db.friend.findMany({
      orderBy: { name: 'asc' },
    });
    return friends.map((friend) => toFriendDto(friend));
  }

  async findUpcoming(): Promise<UpcomingFriendDto[]> {
    const friends = await this.db.friend.findMany({
      where: { birthMonth: { not: null }, birthDay: { not: null } },
    });

    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    return friends
      .map((friend) => {
        const month = friend.birthMonth as number;
        const day = friend.birthDay as number;

        const isBeforeToday =
          month < todayMonth || (month === todayMonth && day < todayDay);
        const anchorYear = today.getFullYear() + (isBeforeToday ? 1 : 0);
        const nextBirthdayDate = new Date(Date.UTC(anchorYear, month - 1, day));

        const turningAge = friend.birthYear
          ? anchorYear - friend.birthYear
          : null;

        return {
          upcoming: {
            ...toFriendDto(friend),
            turningAge,
            nextBirthdayDate: nextBirthdayDate.toISOString().slice(0, 10),
          },
          sortKey: nextBirthdayDate.getTime(),
        };
      })
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((entry) => entry.upcoming);
  }

  async findOne(id: string): Promise<FriendDto> {
    const friend = await this.db.friend.findUnique({ where: { id } });
    if (!friend) {
      throw new NotFoundException(`Friend ${id} not found`);
    }
    return toFriendDto(friend);
  }

  async create(dto: CreateFriendDto): Promise<FriendDto> {
    validateBirthday(dto);
    const friend = await this.db.friend.create({
      data: {
        name: dto.name,
        birthYear: dto.birthYear ?? null,
        birthMonth: dto.birthMonth ?? null,
        birthDay: dto.birthDay ?? null,
        socialMedias: dto.socialMedias ?? undefined,
        preferAnonymous: dto.preferAnonymous ?? true,
      },
    });
    return toFriendDto(friend);
  }

  async update(id: string, dto: UpdateFriendDto): Promise<FriendDto> {
    await this.findOne(id);
    validateBirthday(dto);
    const friend = await this.db.friend.update({
      where: { id },
      data: {
        name: dto.name,
        birthYear: dto.birthYear,
        birthMonth: dto.birthMonth,
        birthDay: dto.birthDay,
        socialMedias: dto.socialMedias,
        preferAnonymous: dto.preferAnonymous,
      },
    });
    return toFriendDto(friend);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.db.friend.delete({ where: { id } });
  }
}

function validateBirthday(dto: CreateFriendDto | UpdateFriendDto): void {
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
    // 2000 is a leap year, so Feb 29 round-trips correctly for month/day-only entries.
    const probe = new Date(2000, birthMonth - 1, birthDay);
    if (probe.getMonth() !== birthMonth - 1 || probe.getDate() !== birthDay) {
      throw new BadRequestException('birthMonth/birthDay is not a valid date');
    }
  }
}

function toFriendDto(friend: Friend): FriendDto {
  return {
    id: friend.id,
    name: friend.name,
    birthYear: friend.birthYear,
    birthMonth: friend.birthMonth,
    birthDay: friend.birthDay,
    socialMedias:
      (friend.socialMedias as Record<string, string> | null) ?? null,
    preferAnonymous: friend.preferAnonymous,
    createdAt: friend.createdAt.toISOString(),
    updatedAt: friend.updatedAt.toISOString(),
  };
}
