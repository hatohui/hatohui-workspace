import type { PrismaClient } from '@prisma/client';
import { seedSocialPlatforms } from './social-platforms';

export async function seedCore(prisma: PrismaClient) {
  await seedSocialPlatforms(prisma);
}
