import type { PrismaClient } from '@prisma/client';

const SINGLETON_ID = 'singleton';
const ADMIN_EMAIL = 'hatohui@gmail.com';

export async function seedAppConfig(prisma: PrismaClient) {
  await prisma.appConfig.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID, adminEmail: ADMIN_EMAIL },
  });
}
