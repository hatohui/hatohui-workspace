import type { Birthday, Profile, User } from '@prisma/client';
import type { ConnectionState } from '@/modules/connections/connections.constants';
import type { FriendDto } from '@/modules/profiles/dto/friend.dto';
import { canViewBirthday } from './birthday-visibility';
import type { ViewerContext } from '@/modules/viewer-context/services/viewer-context.service';

export const PROFILE_INCLUDE = { birthday: true } as const;

export type ProfileWithBirthday = Profile & { birthday: Birthday | null };

/// An unclaimed profile belongs to whoever added it. Once claimed it belongs
/// to the person it describes, and the adder loses control of it — otherwise
/// claiming your own profile would lock you out of your own name and avatar.
export function canEditProfile(
  profile: Pick<Profile, 'userId' | 'addedById'>,
  viewer: User | null,
): boolean {
  if (!viewer) return false;
  if (profile.userId) return profile.userId === viewer.id;
  return profile.addedById === viewer.id;
}

export function toFriendDto(
  profile: ProfileWithBirthday,
  ctx: ViewerContext,
): FriendDto {
  const { viewer } = ctx;
  const birthday = canViewBirthday(profile, ctx) ? profile.birthday : null;

  return {
    id: profile.id,
    name: profile.displayName,
    handle: profile.handle,
    avatarUrl: profile.avatarUrl,
    socialMedias:
      (profile.socialMedias as Record<string, string> | null) ?? null,
    birthYear: birthday?.year ?? null,
    birthMonth: birthday?.month ?? null,
    birthDay: birthday?.day ?? null,
    visibility: birthday?.visibility ?? null,
    addedById: profile.addedById,
    isAssociated: profile.userId !== null,
    isViewerEntry: viewer !== null && profile.userId === viewer.id,
    connectionStatus: connectionStatusOf(profile, ctx),
    canEdit: canEditProfile(profile, viewer),
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

/// Connections are between accounts, so a profile nobody has claimed has no
/// connection state — there is no one on the other side to ask.
function connectionStatusOf(
  profile: ProfileWithBirthday,
  ctx: ViewerContext,
): ConnectionState {
  const { viewer } = ctx;
  const ownerId = profile.userId;
  if (!viewer || !ownerId || ownerId === viewer.id) return 'NONE';

  if (ctx.connections.connectedUserIds.has(ownerId)) return 'ACCEPTED';
  if (ctx.connections.pendingOutgoingUserIds.has(ownerId)) {
    return 'PENDING_OUTGOING';
  }
  if (ctx.connections.pendingIncomingUserIds.has(ownerId)) {
    return 'PENDING_INCOMING';
  }
  return 'NONE';
}
