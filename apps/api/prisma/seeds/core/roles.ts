import type { PrismaClient } from '@prisma/client';

// Keys must match ROLE_KEYS in src/modules/auth/auth.constants.ts.
const ROLES: { key: string; label: string; no: number }[] = [
  { key: 'user', label: 'User', no: 0 },
  { key: 'artist', label: 'Artist', no: 1 },
  { key: 'admin', label: 'Admin', no: 2 },
];

const ADMIN_EMAIL_CONFIG_TYPE = 'admin.email';

export async function seedRoles(prisma: PrismaClient) {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { key: role.key },
      update: { label: role.label, no: role.no },
      create: role,
    });
  }
}

// Every user keeps the baseline 'user' role, and whoever matches the
// configured admin email also gets 'admin' + 'artist' — this is the ongoing
// counterpart to the one-time backfill in migration
// 20260827033300_seed_roles_and_backfill_users, so re-running seedCore stays
// the source of truth rather than relying on that migration forever.
export async function grantBaselineRoles(prisma: PrismaClient) {
  const [userRole, artistRole, adminRole, adminEmailConfig] = await Promise.all(
    [
      prisma.role.findUniqueOrThrow({ where: { key: 'user' } }),
      prisma.role.findUniqueOrThrow({ where: { key: 'artist' } }),
      prisma.role.findUniqueOrThrow({ where: { key: 'admin' } }),
      prisma.systemParameters.findUnique({
        where: {
          type_scope: { type: ADMIN_EMAIL_CONFIG_TYPE, scope: 'ALL' },
        },
      }),
    ],
  );

  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  });
  const adminEmail = adminEmailConfig?.value.toLowerCase() ?? null;

  for (const user of users) {
    const roleIds = [userRole.id];
    if (adminEmail !== null && user.email.toLowerCase() === adminEmail) {
      roleIds.push(artistRole.id, adminRole.id);
    }
    for (const roleId of roleIds) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId } },
        update: {},
        create: { userId: user.id, roleId },
      });
    }
  }
}
