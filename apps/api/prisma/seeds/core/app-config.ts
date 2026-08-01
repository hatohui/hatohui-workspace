import { AppScope, type PrismaClient } from '@prisma/client';

const ADMIN_EMAIL_CONFIG_TYPE = 'admin.email';
const ADMIN_EMAIL = 'hatohui@gmail.com';

export const COMMISSION_RECEIVED_NOTIFICATION_CONFIG_TYPE =
  'art.commissionreceived.notification';
const COMMISSION_RECEIVED_NOTIFICATION_EMAIL = 'hatohui@gmail.com';

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

  await prisma.appConfig.upsert({
    where: {
      type_scope: {
        type: COMMISSION_RECEIVED_NOTIFICATION_CONFIG_TYPE,
        scope: AppScope.ART,
      },
    },
    update: { value: COMMISSION_RECEIVED_NOTIFICATION_EMAIL },
    create: {
      type: COMMISSION_RECEIVED_NOTIFICATION_CONFIG_TYPE,
      scope: AppScope.ART,
      value: COMMISSION_RECEIVED_NOTIFICATION_EMAIL,
    },
  });
}
