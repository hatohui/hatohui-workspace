import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '@/infra/db';
import { AuthService } from '@/modules/auth/services/auth.service';
import {
  AdminUserDto,
  UpdateAdminUserDto,
} from '@/modules/admin/dto/admin-user.dto';
import type { User } from '@prisma/client';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly db: Database,
    private readonly auth: AuthService,
  ) {}

  async list(): Promise<AdminUserDto[]> {
    const users = await this.db.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(users.map((user) => this.toDto(user)));
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
