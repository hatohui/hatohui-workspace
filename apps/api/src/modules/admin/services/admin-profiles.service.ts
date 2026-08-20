import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Database } from '@/infra/db';
import { Cache, CACHE_KEYS } from '@/infra/cache';
import type {
  AdminProfileSortOption,
  AdminSortDirection,
} from '@/modules/admin/admin.constants';
import {
  AdminProfileDto,
  PaginatedAdminProfilesDto,
  UpdateAdminProfileDto,
} from '@/modules/admin/dto/admin-profile.dto';

const WITH_BIRTHDAY = { birthday: true } as const;
type ProfileWithBirthday = Prisma.ProfileGetPayload<{
  include: typeof WITH_BIRTHDAY;
}>;

@Injectable()
export class AdminProfilesService {
  constructor(
    private readonly db: Database,
    private readonly cache: Cache,
  ) {}

  async list(
    query: string | undefined,
    sort: AdminProfileSortOption,
    direction: AdminSortDirection,
    page: number,
    pageSize: number,
  ): Promise<PaginatedAdminProfilesDto> {
    const where: Prisma.ProfileWhereInput = query
      ? {
          OR: [
            { displayName: { contains: query, mode: 'insensitive' } },
            { handle: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {};

    const orderBy: Prisma.ProfileOrderByWithRelationInput =
      sort === 'name' ? { displayName: direction } : { createdAt: direction };

    const [profiles, total] = await Promise.all([
      this.db.profile.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: WITH_BIRTHDAY,
      }),
      this.db.profile.count({ where }),
    ]);

    return {
      items: profiles.map((profile) => this.toDto(profile)),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    };
  }

  async update(
    id: string,
    dto: UpdateAdminProfileDto,
  ): Promise<AdminProfileDto> {
    const existing = await this.db.profile.findUnique({
      where: { id },
      include: WITH_BIRTHDAY,
    });
    if (!existing) {
      throw new NotFoundException('Profile not found');
    }

    const { birthYear, birthMonth, birthDay, visibility, ...profileDto } = dto;
    const touchesBirthday =
      birthYear !== undefined ||
      birthMonth !== undefined ||
      birthDay !== undefined ||
      visibility !== undefined;

    if (touchesBirthday && !existing.birthday) {
      throw new BadRequestException(
        'This profile has no birthday yet — add one from the friends app first',
      );
    }

    await this.db.$transaction([
      this.db.profile.update({ where: { id }, data: profileDto }),
      ...(touchesBirthday
        ? [
            this.db.birthday.update({
              where: { profileId: id },
              data: {
                year: birthYear === undefined ? undefined : birthYear,
                month: birthMonth,
                day: birthDay,
                visibility,
              },
            }),
          ]
        : []),
    ]);

    if (touchesBirthday) {
      await this.cache.invalidate(CACHE_KEYS.birthdaysList());
    }

    const updated = await this.db.profile.findUniqueOrThrow({
      where: { id },
      include: WITH_BIRTHDAY,
    });
    return this.toDto(updated);
  }

  private toDto(profile: ProfileWithBirthday): AdminProfileDto {
    return {
      id: profile.id,
      name: profile.displayName,
      handle: profile.handle,
      avatarUrl: profile.avatarUrl,
      birthYear: profile.birthday?.year ?? null,
      birthMonth: profile.birthday?.month ?? null,
      birthDay: profile.birthday?.day ?? null,
      visibility: profile.birthday?.visibility ?? null,
      addedById: profile.addedById,
      isAssociated: profile.userId !== null,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }
}
