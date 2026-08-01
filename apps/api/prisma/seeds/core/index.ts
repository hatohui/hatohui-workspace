import type { PrismaClient } from '@prisma/client';
import { seedAppConfig } from './app-config';
import { seedSocialPlatforms } from './social-platforms';
import { seedCommissionPricing } from './commission-pricing';

export async function seedCore(prisma: PrismaClient) {
  await seedSocialPlatforms(prisma);
  await seedAppConfig(prisma);
  await seedCommissionPricing(prisma);
}
