import { Injectable } from '@nestjs/common';
import { AppScope, type User } from '@prisma/client';
import { Database } from '@/infra/db';
import { Cache, CACHE_KEYS } from '@/infra/cache';
import { AuthService } from '@/modules/auth/services/auth.service';
import {
  TRAVEL_EDITORS_CACHE_TTL_SECONDS,
  TRAVEL_EDITORS_PARAMETER_TYPE,
  TRAVEL_EDITORS_SEPARATOR,
} from '@/modules/travel-access/travel-access.constants';

@Injectable()
export class TravelAccessService {
  constructor(
    private readonly db: Database,
    private readonly cache: Cache,
    private readonly auth: AuthService,
  ) {}

  async canEdit(user: User | null): Promise<boolean> {
    if (!user) return false;
    if (await this.auth.isAdmin(user)) return true;
    const editors = await this.editorEmails();
    return editors.includes(user.email.toLowerCase());
  }

  private editorEmails(): Promise<string[]> {
    return this.cache.getOrSet(
      CACHE_KEYS.travelEditors(),
      TRAVEL_EDITORS_CACHE_TTL_SECONDS,
      async () => {
        const row = await this.db.systemParameters.findUnique({
          where: {
            type_scope: {
              type: TRAVEL_EDITORS_PARAMETER_TYPE,
              scope: AppScope.TRAVEL,
            },
          },
          select: { value: true },
        });
        return (row?.value ?? '')
          .split(TRAVEL_EDITORS_SEPARATOR)
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean);
      },
    );
  }
}
