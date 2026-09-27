import type { Database } from '@/infra/db';
import { UNASSIGNED_ARTIST_SEGMENT } from '@/common/utils/asset-paths';

export async function artistFolderOf(
  db: Database,
  userId: string | null,
): Promise<string> {
  if (!userId) return UNASSIGNED_ARTIST_SEGMENT;
  const profile = await db.profile.findUnique({
    where: { userId },
    select: { handle: true },
  });
  return profile?.handle ?? userId;
}
