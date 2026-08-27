import type { PrismaClient } from '@prisma/client';

const DEV_ARTIST_GOOGLE_ID = 'dev-artist-seed';
const DEV_ARTIST_EMAIL = 'artist@example.dev';

const ENABLED_TYPES: {
  typeKey: string;
  options: {
    key: string;
    label: string;
    priceMode: 'FIXED' | 'STARTING_FROM' | 'RANGE';
    minPrice: number;
    maxPrice?: number;
  }[];
}[] = [
  {
    typeKey: 'ICON',
    options: [{ key: 'ICON', label: 'Icon', priceMode: 'FIXED', minPrice: 3000 }],
  },
  {
    typeKey: 'BUST',
    options: [
      { key: 'SKETCHED', label: 'Sketched', priceMode: 'FIXED', minPrice: 3600 },
      {
        key: 'FULLY_RENDERED',
        label: 'Fully Rendered',
        priceMode: 'FIXED',
        minPrice: 6000,
      },
    ],
  },
  {
    typeKey: 'FULL',
    options: [
      {
        key: 'FULLY_RENDERED',
        label: 'Fully Rendered',
        priceMode: 'STARTING_FROM',
        minPrice: 10000,
      },
    ],
  },
  {
    typeKey: 'SKETCHPAGE',
    options: [
      {
        key: 'STANDARD',
        label: 'Standard',
        priceMode: 'RANGE',
        minPrice: 15000,
        maxPrice: 22000,
      },
    ],
  },
];

const ADDONS: {
  key: string;
  label: string;
  priceMode: 'FIXED' | 'STARTING_FROM' | 'RANGE' | 'PERCENTAGE';
  minPrice?: number;
  maxPrice?: number;
  percent?: number;
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
  {
    key: 'RUSH',
    label: 'Rush',
    priceMode: 'PERCENTAGE',
    percent: 25,
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

  // A public handle is what makes the artist reachable at /[artist] at all —
  // real artists get one through onboarding, but the dev seed has to set it
  // directly since nothing here goes through that flow.
  await prisma.profile.upsert({
    where: { userId: artist.id },
    update: {},
    create: {
      userId: artist.id,
      displayName: 'Dev Artist',
      handle: 'dev-artist',
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: artist.id, roleId: artistRole.id } },
    update: {},
    create: { userId: artist.id, roleId: artistRole.id },
  });

  for (const [index, entry] of ENABLED_TYPES.entries()) {
    const type = await prisma.commissionType.findUnique({
      where: { key: entry.typeKey },
    });
    if (!type) continue;

    await prisma.artistCommissionType.upsert({
      where: {
        artistId_commissionTypeId: {
          artistId: artist.id,
          commissionTypeId: type.id,
        },
      },
      update: {},
      create: { artistId: artist.id, commissionTypeId: type.id, no: index },
    });

    for (const [optionIndex, option] of entry.options.entries()) {
      await prisma.commissionOption.upsert({
        where: {
          artistId_commissionTypeId_key: {
            artistId: artist.id,
            commissionTypeId: type.id,
            key: option.key,
          },
        },
        update: {},
        create: {
          artistId: artist.id,
          commissionTypeId: type.id,
          no: optionIndex,
          ...option,
        },
      });
    }
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
      value: JSON.stringify({ enabled: true, thresholdDays: 10, feeAmount: 2500 }),
    },
  });
}
