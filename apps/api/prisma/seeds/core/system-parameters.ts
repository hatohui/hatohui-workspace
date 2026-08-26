import { AppScope, type PrismaClient } from '@prisma/client';

const ADMIN_EMAIL_CONFIG_TYPE = 'admin.email';
const ADMIN_EMAIL = 'hatohui@gmail.com';

const BIRTHDAY_DEFAULTS: [type: string, value: string][] = [
  ['friends.birthday.reminderdays', '7'],
  ['friends.birthday.dailysendcap', '250'],
  ['friends.birthday.senderemail', 'noreply@hatohui.com'],
  ['friends.birthday.sendername', 'Friends - Hatohui Notifications'],
  ['friends.birthday.avatarurl', 'https://assets.hatohui.com/assets/wqee.jpg'],
];

export async function seedSystemParameters(prisma: PrismaClient) {
  await prisma.systemParameters.upsert({
    where: {
      type_scope: { type: ADMIN_EMAIL_CONFIG_TYPE, scope: AppScope.ALL },
    },
    update: {},
    create: {
      type: ADMIN_EMAIL_CONFIG_TYPE,
      scope: AppScope.ALL,
      value: ADMIN_EMAIL,
    },
  });

  for (const [type, value] of BIRTHDAY_DEFAULTS) {
    await prisma.systemParameters.upsert({
      where: { type_scope: { type, scope: AppScope.FRIENDS } },
      update: {},
      create: { type, scope: AppScope.FRIENDS, value },
    });
  }
}
