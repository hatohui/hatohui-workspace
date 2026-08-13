import { Injectable } from '@nestjs/common';
import { Database } from '@/libs/db';
import { FriendDto } from '@/modules/friends/dto/friend.dto';

@Injectable()
export class AdminService {
  constructor(private readonly db: Database) {}

  /// Every profile, birthday visibility ignored. This is the one place that
  /// bypass exists — the normal endpoints apply the same filtering to admins
  /// as to anyone else, so an admin browsing the app sees what a member would.
  async listAllEntries(): Promise<FriendDto[]> {
    const profiles = await this.db.profile.findMany({
      orderBy: { displayName: 'asc' },
      include: { birthday: true },
    });

    return profiles.map((profile) => ({
      id: profile.id,
      name: profile.displayName,
      handle: profile.handle,
      avatarUrl: profile.avatarUrl,
      socialMedias:
        (profile.socialMedias as Record<string, string> | null) ?? null,
      birthYear: profile.birthday?.year ?? null,
      birthMonth: profile.birthday?.month ?? null,
      birthDay: profile.birthday?.day ?? null,
      visibility: profile.birthday?.visibility ?? null,
      addedById: profile.addedById,
      isAssociated: profile.userId !== null,
      isViewerEntry: false,
      connectionStatus: 'NONE' as const,
      canEdit: true,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    }));
  }
}
