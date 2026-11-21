import type { Prisma } from '@prisma/client';
import type { TravelCreatorDto } from '@/modules/travel-recommendations/dto/travel-recommendation.dto';

export const travelCreatorSelect = {
  id: true,
  name: true,
  profile: { select: { displayName: true, avatarUrl: true } },
} satisfies Prisma.UserSelect;

type CreatorRow = Prisma.UserGetPayload<{ select: typeof travelCreatorSelect }>;

export function toTravelCreatorDto(
  row: CreatorRow | null,
): TravelCreatorDto | null {
  if (!row) return null;
  return {
    id: row.id,
    name: row.profile?.displayName || row.name,
    avatarUrl: row.profile?.avatarUrl ?? null,
  };
}
