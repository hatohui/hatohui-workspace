import { ConflictException, Injectable } from '@nestjs/common';
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
      association: { isNot: null },
      ...(needle
        ? {
            OR: [
              { name: { contains: needle, mode: 'insensitive' as const } },
              { handle: { contains: needle, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      this.db.user.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: PUBLIC_USER_SELECT,
      }),
      this.db.user.count({ where }),
    ]);

    return { items: users.map(toPublicUserDto), total, page, pageSize };
  }

  async updateMe(dto: UpdateMeDto, viewer: User): Promise<User> {
    if (dto.handle === undefined) return viewer;

    return this.db.user
      .update({ where: { id: viewer.id }, data: { handle: dto.handle } })
      .catch((error) => {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException('That handle is already taken');
        }
        throw error;
      });
  }
}
