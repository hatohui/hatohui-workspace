import { Injectable } from '@nestjs/common';
import { Database } from '@/libs/db';
import { FriendDto } from '@/modules/friends/dto/friend.dto';

@Injectable()
export class AdminService {
  constructor(private readonly db: Database) {}

  /// Every entry, visibility ignored. This is the one place that bypass
  /// exists — the normal endpoints apply the same filtering to admins as to
  /// anyone else, so an admin browsing the app sees what a member would.
  async listAllEntries(): Promise<FriendDto[]> {
    const entries = await this.db.birthdayDetails.findMany({
      orderBy: { name: 'asc' },
      include: {
        association: {
          select: { userId: true, user: { select: { handle: true } } },
        },
      },
    });

    return entries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      birthYear: entry.birthYear,
      birthMonth: entry.birthMonth,
      birthDay: entry.birthDay,
      socialMedias:
        (entry.socialMedias as Record<string, string> | null) ?? null,
      preferAnonymous: entry.preferAnonymous,
      visibility: entry.visibility,
      avatarUrl: entry.avatarUrl,
      addedById: entry.addedById,
      handle: entry.association?.user.handle ?? null,
      isAssociated: entry.association !== null,
      isViewerEntry: false,
      connectionStatus: 'NONE' as const,
      canEdit: true,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }));
  }
}
