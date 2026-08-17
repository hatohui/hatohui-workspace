import { Injectable } from '@nestjs/common';
import { AppScope } from '@prisma/client';
import { Database } from '@/libs/db';

@Injectable()
export class UserSettingsService {
  constructor(private readonly db: Database) {}

  async get(
    userId: string,
    scope: AppScope,
    type: string,
  ): Promise<string | null> {
    const row = await this.db.userSetting.findUnique({
      where: { userId_type_scope: { userId, type, scope } },
      select: { value: true },
    });
    return row?.value ?? null;
  }

  async set(
    userId: string,
    scope: AppScope,
    type: string,
    value: string,
  ): Promise<void> {
    await this.db.userSetting.upsert({
      where: { userId_type_scope: { userId, type, scope } },
      create: { userId, scope, type, value },
      update: { value },
    });
  }

  async clear(userId: string, scope: AppScope, type: string): Promise<void> {
    await this.db.userSetting.deleteMany({ where: { userId, scope, type } });
  }

  async getForScope(
    userId: string,
    scope: AppScope,
  ): Promise<Map<string, string>> {
    const rows = await this.db.userSetting.findMany({
      where: { userId, scope },
      select: { type: true, value: true },
    });
    return new Map(rows.map((row) => [row.type, row.value]));
  }

  async getManyUsers(
    userIds: string[],
    scope: AppScope,
    type: string,
  ): Promise<Map<string, string>> {
    if (userIds.length === 0) return new Map();
    const rows = await this.db.userSetting.findMany({
      where: { userId: { in: userIds }, scope, type },
      select: { userId: true, value: true },
    });
    return new Map(rows.map((row) => [row.userId, row.value]));
  }
}
