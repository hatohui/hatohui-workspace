import type { PrismaClient } from '@prisma/client';
import { seedFriends } from './friends';
import { seedCommissionPricing } from './commission-pricing';

export async function seedDevelopment(prisma: PrismaClient) {
  await seedFriends(prisma);
  await seedCommissionPricing(prisma);
}
