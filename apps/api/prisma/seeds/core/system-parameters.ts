import { AppScope, type PrismaClient } from '@prisma/client';

const ADMIN_EMAIL_CONFIG_TYPE = 'admin.email';
const ADMIN_EMAIL = 'hatohui@gmail.com';

const IMAGE_UPLOAD_DEFAULTS: [type: string, value: string][] = [
  ['images.upload.maxbytes', String(25 * 1024 * 1024)],
  ['images.upload.maxfiles', '10'],
];

const FRIENDS_DEFAULTS: [type: string, value: string][] = [
  ['friends.birthday.reminderdays', '7'],
  ['friends.birthday.dailysendcap', '250'],
  ['friends.birthday.senderemail', 'noreply@hatohui.com'],
  ['friends.birthday.sendername', 'Friends - Hatohui Notifications'],
  ['friends.birthday.avatarurl', 'https://assets.hatohui.com/assets/wqee.jpg'],
  ['friends.notifications.senderemail', 'noreply@hatohui.com'],
  ['friends.notifications.sendername', 'Friends - Hatohui Notifications'],
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

  for (const [type, value] of FRIENDS_DEFAULTS) {
    await prisma.systemParameters.upsert({
      where: { type_scope: { type, scope: AppScope.FRIENDS } },
      update: {},
      create: { type, scope: AppScope.FRIENDS, value },
    });
  }

  for (const [type, value] of IMAGE_UPLOAD_DEFAULTS) {
    await prisma.systemParameters.upsert({
      where: { type_scope: { type, scope: AppScope.ALL } },
      update: {},
      create: { type, scope: AppScope.ALL, value },
    });
  }
}
