import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Database } from '@/libs/db';
import { Prisma, type User } from '@prisma/client';
import { PaginatedUsersDto, UpdateMeDto } from './dto/user.dto';
import { PUBLIC_USER_SELECT, toPublicUserDto } from './dto/public-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly db: Database) {}

  /// Finds accounts to connect with, by name or @handle. Only accounts that
  /// have claimed a directory entry are offered — an unclaimed entry has
  /// nobody behind it to accept a request. Returns PublicUserDto, so no
  /// contact details ever leave here.
  async search(
    query: string | undefined,
    page: number,
    pageSize: number,
    viewer: User,
  ): Promise<PaginatedUsersDto> {
    const needle = query?.trim();
    const where: Prisma.UserWhereInput = {
      id: { not: viewer.id },
      profile: { isNot: null },
      ...(needle
        ? {
            OR: [
              { name: { contains: needle, mode: 'insensitive' as const } },
              {
                profile: {
                  displayName: {
                    contains: needle,
                    mode: 'insensitive' as const,
                  },
                },
              },
              {
                profile: {
                  handle: { contains: needle, mode: 'insensitive' as const },
                },
              },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      this.db.user.findMany({
        where,
        orderBy: { profile: { displayName: 'asc' } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: PUBLIC_USER_SELECT,
      }),
      this.db.user.count({ where }),
    ]);

    return { items: users.map(toPublicUserDto), total, page, pageSize };
  }

  /// Both fields describe the public persona, so they live on the profile —
  /// an account that never opted in has none to update.
  async updateMe(dto: UpdateMeDto, viewer: User): Promise<User> {
    if (dto.handle === undefined && dto.displayName === undefined) {
      return viewer;
    }

    await this.db.profile
      .update({
        where: { userId: viewer.id },
        data: { handle: dto.handle, displayName: dto.displayName },
      })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ConflictException('That handle is already taken');
          }
          if (error.code === 'P2025') {
            throw new BadRequestException(
              'Join the directory before setting a handle or display name',
            );
          }
        }
        throw error;
      });

    return viewer;
  }
}
