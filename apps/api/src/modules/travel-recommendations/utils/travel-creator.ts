import type { Prisma } from '@prisma/client';
import type { TravelCreatorDto } from '@/modules/travel-recommendations/dto/travel-recommendation.dto';

export const travelCreatorSelect = {
  id: true,
  name: true,
  profile: { select: { displayName: true, avatarUrl: true, handle: true } },
} satisfies Prisma.UserSelect;

type CreatorRow = Prisma.UserGetPayload<{ select: typeof travelCreatorSelect }>;

export function travelCreatorFilter(
  handle: string | undefined,
): Prisma.UserWhereInput | undefined {
  const clean = handle?.trim().replace(/^@/, '').toLowerCase();
  return clean ? { profile: { handle: clean } } : undefined;
}

export function toTravelCreatorDto(
  row: CreatorRow | null,
): TravelCreatorDto | null {
  if (!row) return null;
  return {
    id: row.id,
    name: row.profile?.displayName || row.name,
    avatarUrl: row.profile?.avatarUrl ?? null,
    handle: row.profile?.handle ?? null,
  };
}
