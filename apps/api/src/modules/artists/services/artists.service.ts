import { Injectable } from '@nestjs/common';
import { AppScope } from '@prisma/client';
import { Database } from '@/infra/db';
import {
  ADMIN_EMAIL_CONFIG_TYPE,
  ROLE_KEYS,
} from '@/modules/auth/auth.constants';
import {
  PUBLIC_USER_SELECT,
  PublicUserDto,
  toPublicUserDto,
} from '@/modules/users/dto/public-user.dto';

@Injectable()
export class ArtistsService {
  constructor(private readonly db: Database) {}

  async findSiteArtist(): Promise<PublicUserDto | null> {
    const [adminEmail, artists] = await Promise.all([
      this.db.systemParameters.findUnique({
        where: {
          type_scope: { type: ADMIN_EMAIL_CONFIG_TYPE, scope: AppScope.ALL },
        },
        select: { value: true },
      }),
      this.db.user.findMany({
        where: { roles: { some: { role: { key: ROLE_KEYS.artist } } } },
        select: { ...PUBLIC_USER_SELECT, email: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const owner = adminEmail?.value.toLowerCase();
    const artist =
      artists.find((user) => user.email.toLowerCase() === owner) ?? artists[0];
    return artist ? toPublicUserDto(artist) : null;
  }
}
