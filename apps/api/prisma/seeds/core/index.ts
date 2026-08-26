import type { PrismaClient } from '@prisma/client';
import { seedSystemParameters } from './system-parameters';
import { seedSocialPlatforms } from './social-platforms';
import { seedRoles, grantBaselineRoles } from './roles';

export async function seedCore(prisma: PrismaClient) {
  await seedRoles(prisma);
  await seedSocialPlatforms(prisma);
  await seedSystemParameters(prisma);
  await grantBaselineRoles(prisma);
}
