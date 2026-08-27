import { Injectable } from '@nestjs/common';
import { Database } from '@/infra/db';
import { AuthService } from '@/modules/auth/services/auth.service';
import { ROLE_KEYS } from '@/modules/auth/auth.constants';
import {
  PUBLIC_USER_SELECT,
  PublicUserDto,
  toPublicUserDto,
} from '@/modules/users/dto/public-user.dto';

@Injectable()
export class ArtistsService {
  constructor(
    private readonly db: Database,
    private readonly auth: AuthService,
  ) {}

  /** Every artist with a public handle — a handle-less artist has no
   * storefront URL yet, so they're excluded from the picker. */
  async list(): Promise<PublicUserDto[]> {
    const rows = await this.db.user.findMany({
      where: {
        roles: { some: { role: { key: ROLE_KEYS.artist } } },
        profile: { handle: { not: null } },
      },
      select: PUBLIC_USER_SELECT,
      orderBy: { name: 'asc' },
    });
    return rows.map(toPublicUserDto);
  }

  /** Resolves a storefront handle to its artist, or null if the handle
   * doesn't exist or belongs to someone who isn't an artist — both cases are
   * a 404 to the caller, so they're deliberately not distinguished here. */
  async findByHandle(handle: string): Promise<PublicUserDto | null> {
    const profile = await this.db.profile.findUnique({
      where: { handle },
      select: { user: { select: PUBLIC_USER_SELECT } },
    });
    if (!profile?.user) return null;
    if (!(await this.auth.isArtistById(profile.user.id))) return null;
    return toPublicUserDto(profile.user);
  }
}
