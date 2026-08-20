import { CommissionType, type PrismaClient } from '@prisma/client';

const TYPE_PRICING: { type: CommissionType; basePriceCents: number }[] = [
  { type: CommissionType.ICON, basePriceCents: 3000 },
  { type: CommissionType.HALF_BODY, basePriceCents: 6000 },
  { type: CommissionType.FULL_BODY, basePriceCents: 10000 },
  { type: CommissionType.SKETCH_PAGE, basePriceCents: 18000 },
];

const OPTION_PRICING: { key: string; modifierPercent: number }[] = [
  { key: 'FULLY_RENDERED', modifierPercent: 0 },
  { key: 'SKETCHED', modifierPercent: -40 },
];

const ADDON_PRICING: { key: string; minPriceCents: number }[] = [
  { key: 'COMPLEX_COSTUME', minPriceCents: 2000 },
  { key: 'BACKGROUND', minPriceCents: 3000 },
];

export const RUSH_FEE_SETTING_ID = 'commission-rush-fee-singleton';

export async function seedCommissionPricing(prisma: PrismaClient) {
  await prisma.commissionRushFeeSetting.upsert({
    where: { id: RUSH_FEE_SETTING_ID },
    update: {},
    create: { id: RUSH_FEE_SETTING_ID, thresholdDays: 10, feeCents: 2500 },
  });

  for (const row of TYPE_PRICING) {
    await prisma.commissionTypePricing.upsert({
      where: { type: row.type },
      update: {},
      create: row,
    });
  }

  for (const row of OPTION_PRICING) {
    await prisma.commissionOptionPricing.upsert({
      where: { key: row.key },
      update: {},
      create: row,
    });
  }

  for (const row of ADDON_PRICING) {
    await prisma.commissionAddonPricing.upsert({
      where: { key: row.key },
      update: {},
      create: row,
    });
  }
}
