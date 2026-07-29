import type { PrismaClient } from '@prisma/client';
import { seedAppConfig } from './app-config';
import { seedSocialPlatforms } from './social-platforms';

export async function seedCore(prisma: PrismaClient) {
  await seedSocialPlatforms(prisma);
  await seedAppConfig(prisma);
}
