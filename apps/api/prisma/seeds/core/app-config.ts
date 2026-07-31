import { AppScope, type PrismaClient } from '@prisma/client';

const ADMIN_EMAIL_CONFIG_TYPE = 'admin.email';
const ADMIN_EMAIL = 'hatohui@gmail.com';

export async function seedAppConfig(prisma: PrismaClient) {
  await prisma.appConfig.upsert({
    where: {
      type_scope: { type: ADMIN_EMAIL_CONFIG_TYPE, scope: AppScope.ALL },
    },
    update: { value: ADMIN_EMAIL },
    create: {
      type: ADMIN_EMAIL_CONFIG_TYPE,
      scope: AppScope.ALL,
      value: ADMIN_EMAIL,
    },
  });
}
