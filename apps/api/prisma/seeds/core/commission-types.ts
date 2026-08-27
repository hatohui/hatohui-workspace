import type { PrismaClient } from '@prisma/client';

const COMMISSION_TYPES: { key: string; label: string; tagName: string }[] = [
  { key: 'SKETCH', label: 'Sketch', tagName: 'Sketch' },
  { key: 'LINEART', label: 'Lineart', tagName: 'Lineart' },
  { key: 'ICON', label: 'Icon', tagName: 'Icon' },
  { key: 'BUST', label: 'Bust', tagName: 'Bust' },
  { key: 'FULL', label: 'Full Body', tagName: 'Full Body' },
  { key: 'SKETCHPAGE', label: 'Sketch Page', tagName: 'Sketch Page' },
  { key: 'COMIC', label: 'Comic', tagName: 'Comic' },
  { key: 'ANIMATION', label: 'Animation', tagName: 'Animation' },
];

/** Platform-wide commission type catalog. Artists opt into individual entries
 * via ArtistCommissionType; this seed only ensures the catalog itself exists. */
export async function seedCommissionTypes(prisma: PrismaClient) {
  for (const [index, type] of COMMISSION_TYPES.entries()) {
    const tag = await prisma.tag.upsert({
      where: { name: type.tagName },
      update: {},
      create: { name: type.tagName },
    });
    await prisma.commissionType.upsert({
      where: { key: type.key },
      update: {},
      create: {
        key: type.key,
        label: type.label,
        no: index,
        tagId: tag.id,
      },
    });
  }
}
