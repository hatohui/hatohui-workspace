import { Database } from '@/infra/db';
import { MAX_COLLISION_RETRIES } from '@/modules/users/users.constants';

function slugifyBase(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9_]+/g, '')
    .slice(0, 20);
  return slug.length >= 3 ? slug : `user${slug}`;
}

export async function generateUniqueHandle(
  db: Database,
  name: string,
): Promise<string> {
  const base = slugifyBase(name).slice(0, 16);

  for (let attempt = 0; attempt <= MAX_COLLISION_RETRIES; attempt++) {
    const candidate = attempt === 0 ? base : `${base}_${attempt + 1}`;
    const existing = await db.profile.findUnique({
      where: { handle: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }

  return `${base}_${Date.now().toString(36)}`;
}
