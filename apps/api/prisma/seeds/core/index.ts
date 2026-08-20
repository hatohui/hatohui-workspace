import type { PrismaClient } from '@prisma/client';
import { seedSystemParameters } from './system-parameters';
import { seedSocialPlatforms } from './social-platforms';
import { seedCommissionPricing } from './commission-pricing';

export async function seedCore(prisma: PrismaClient) {
  await seedSocialPlatforms(prisma);
  await seedSystemParameters(prisma);
  await seedCommissionPricing(prisma);
}
