import type { PrismaClient } from '@prisma/client';

const DEV_ARTIST_GOOGLE_ID = 'dev-artist-seed';
const DEV_ARTIST_EMAIL = 'artist@example.dev';

const TYPES: {
  key: string;
  label: string;
  basePrice: number;
  tagName: string;
}[] = [
  { key: 'ICON', label: 'Icon', basePrice: 3000, tagName: 'Icon' },
  {
    key: 'HALF_BODY',
    label: 'Half Body',
    basePrice: 6000,
    tagName: 'Half Body',
  },
  {
    key: 'FULL_BODY',
    label: 'Full Body',
    basePrice: 10000,
    tagName: 'Full Body',
  },
  {
    key: 'SKETCH_PAGE',
    label: 'Sketch Page',
    basePrice: 18000,
    tagName: 'Sketch Page',
  },
];

const OPTIONS: { key: string; label: string; modifierPercent: number }[] = [
  { key: 'FULLY_RENDERED', label: 'Fully Rendered', modifierPercent: 0 },
  { key: 'SKETCHED', label: 'Sketched', modifierPercent: -40 },
];

const ADDONS: {
  key: string;
  label: string;
  priceMode: 'FIXED' | 'STARTING_FROM' | 'RANGE';
  minPrice: number;
  maxPrice?: number;
}[] = [
  {
    key: 'COMPLEX_COSTUME',
    label: 'Complex Costume',
    priceMode: 'STARTING_FROM',
    minPrice: 2000,
  },
  {
    key: 'BACKGROUND',
    label: 'Background',
    priceMode: 'RANGE',
    minPrice: 3000,
    maxPrice: 6000,
  },
];

export async function seedCommissionPricing(prisma: PrismaClient) {
  const artistRole = await prisma.role.findUnique({
    where: { key: 'artist' },
  });
  if (!artistRole) return;

  const artist = await prisma.user.upsert({
    where: { googleId: DEV_ARTIST_GOOGLE_ID },
    update: {},
    create: {
      googleId: DEV_ARTIST_GOOGLE_ID,
      email: DEV_ARTIST_EMAIL,
      name: 'Dev Artist',
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: artist.id, roleId: artistRole.id } },
    update: {},
    create: { userId: artist.id, roleId: artistRole.id },
  });

  for (const type of TYPES) {
    const tag = await prisma.tag.upsert({
      where: { name: type.tagName },
      update: {},
      create: { name: type.tagName },
    });
    await prisma.commissionType.upsert({
      where: { artistId_key: { artistId: artist.id, key: type.key } },
      update: {},
      create: {
        artistId: artist.id,
        key: type.key,
        label: type.label,
        basePrice: type.basePrice,
        tagId: tag.id,
      },
    });
  }

  for (const option of OPTIONS) {
    await prisma.commissionOption.upsert({
      where: { artistId_key: { artistId: artist.id, key: option.key } },
      update: {},
      create: { artistId: artist.id, ...option },
    });
  }

  for (const addon of ADDONS) {
    await prisma.commissionAddon.upsert({
      where: { artistId_key: { artistId: artist.id, key: addon.key } },
      update: {},
      create: { artistId: artist.id, ...addon },
    });
  }

  await prisma.userSetting.upsert({
    where: {
      userId_type_scope: {
        userId: artist.id,
        type: 'art.commission.currency',
        scope: 'ART',
      },
    },
    update: {},
    create: {
      userId: artist.id,
      scope: 'ART',
      type: 'art.commission.currency',
      value: 'USD',
    },
  });

  await prisma.userSetting.upsert({
    where: {
      userId_type_scope: {
        userId: artist.id,
        type: 'art.commission.rushfee',
        scope: 'ART',
      },
    },
    update: {},
    create: {
      userId: artist.id,
      scope: 'ART',
      type: 'art.commission.rushfee',
      value: JSON.stringify({ thresholdDays: 10, feeAmount: 2500 }),
    },
  });
}
