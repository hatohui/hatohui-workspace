import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { Database } from '@/infra/db';
import { ConnectionsService } from '@/modules/connections/services/connections.service';
import { SocialGraphDto } from '@/modules/social-graph/dto/social-graph.dto';
import {
  PROFILE_INCLUDE,
  toFriendDto,
  type ProfileWithBirthday,
} from '@/modules/profiles/utils/profile.mapper';
import { ViewerContextService } from '@/modules/viewer-context/services/viewer-context.service';
import {
  FRIEND_LIMIT,
  FRIEND_OF_FRIEND_LIMIT,
} from '@/modules/social-graph/social-graph.constants';

@Injectable()
export class SocialGraphService {
  constructor(
    private readonly db: Database,
    private readonly connections: ConnectionsService,
    private readonly viewerContext: ViewerContextService,
  ) {}

  /// Renders as: you -- someone in your circle -- someone in theirs.
  async getSocialGraph(viewer: User): Promise<SocialGraphDto> {
    const ctx = await this.viewerContext.for(viewer);
    const own = await this.circleProfiles(viewer.id);
    const firstRing = own.slice(0, FRIEND_LIMIT);
    const seen = new Set(firstRing.map((profile) => profile.id));

    const friends = await Promise.all(
      firstRing.map(async (profile) => {
        // Only a claimed profile has an account whose own circle we can walk.
        const ownerId = profile.userId;
        const friendsOfFriend =
          ownerId && ownerId !== viewer.id
            ? (await this.circleProfiles(ownerId))
                // A first-ring friend's circle legitimately includes the
                // viewer, who would otherwise show up as their own friend.
                .filter(
                  (other) => !seen.has(other.id) && other.userId !== viewer.id,
                )
                .slice(0, FRIEND_OF_FRIEND_LIMIT)
            : [];
        for (const other of friendsOfFriend) seen.add(other.id);

        return {
          friend: toFriendDto(profile, ctx),
          friendsOfFriend: friendsOfFriend.map((other) =>
            toFriendDto(other, ctx),
          ),
        };
      }),
    );

    return { friends };
  }

  /// Everyone in one account's circle: profiles they added, plus the profiles
  /// of accounts they are connected with.
  private async circleProfiles(userId: string): Promise<ProfileWithBirthday[]> {
    const connections = await this.connections.getContext(userId);
    const connectedIds = [...connections.connectedUserIds];

    const profiles = await this.db.profile.findMany({
      where: {
        OR: [
          { addedById: userId },
          ...(connectedIds.length > 0
            ? [{ userId: { in: connectedIds } }]
            : []),
        ],
      },
      orderBy: { displayName: 'asc' },
      include: PROFILE_INCLUDE,
    });

    return profiles.filter((profile) => profile.userId !== userId);
  }
}
