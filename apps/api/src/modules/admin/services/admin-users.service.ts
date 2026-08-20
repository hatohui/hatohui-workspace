import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type OnboardingStatus, type User } from '@prisma/client';
import { Database } from '@/infra/db';
import { AuthService } from '@/modules/auth/services/auth.service';
import type {
  AdminSortDirection,
  AdminUserSortOption,
} from '@/modules/admin/admin.constants';
import {
  AdminUserDto,
  PaginatedAdminUsersDto,
  UpdateAdminUserDto,
} from '@/modules/admin/dto/admin-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly db: Database,
    private readonly auth: AuthService,
  ) {}

  async list(
    query: string | undefined,
    onboardingStatus: OnboardingStatus | undefined,
    sort: AdminUserSortOption,
    direction: AdminSortDirection,
    page: number,
    pageSize: number,
  ): Promise<PaginatedAdminUsersDto> {
    const where: Prisma.UserWhereInput = {
      AND: [
        onboardingStatus ? { onboardingStatus } : {},
        query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    const [users, total] = await Promise.all([
      this.db.user.findMany({
        where,
        orderBy: { [sort]: direction },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.user.count({ where }),
    ]);

    return {
      items: await Promise.all(users.map((user) => this.toDto(user))),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    };
  }

  async update(id: string, dto: UpdateAdminUserDto): Promise<AdminUserDto> {
    const existing = await this.db.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const user = await this.db.user.update({ where: { id }, data: dto });
    return this.toDto(user);
  }

  private async toDto(user: User): Promise<AdminUserDto> {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      timezone: user.timezone,
      onboardingStatus: user.onboardingStatus,
      isAdmin: await this.auth.isAdmin(user),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
