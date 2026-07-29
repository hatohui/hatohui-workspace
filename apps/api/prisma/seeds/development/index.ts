import type { PrismaClient } from '@prisma/client';
import { seedFriends } from './friends';

export async function seedDevelopment(prisma: PrismaClient) {
  await seedFriends(prisma);
}
