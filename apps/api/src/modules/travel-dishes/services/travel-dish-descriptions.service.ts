import { Injectable } from '@nestjs/common';
import { Database } from '@/infra/db';
import { AiService, type AiJsonSchema } from '@/modules/ai/services/ai.service';
import { GenerateTravelDishDescriptionsResultDto } from '@/modules/travel-dishes/dto/travel-dish.dto';
import { TRAVEL_NOTE_MAX_LENGTH } from '@/modules/travel-recommendations/travel-recommendations.constants';

const BATCH_SIZE = 20;

const DESCRIPTION_SYSTEM_INSTRUCTION = [
  'You write concise, appetizing English culinary descriptions for a travel food catalog.',
  'For each dish, write one short phrase (3 to 12 words, e.g. "Vietnamese crispy savory pancake" or "Steamed rice rolls filled with seasoned pork and mushrooms") explaining what the dish is to a traveler.',
  'Use natural English and keep traditional dish or brand names accurate.',
  'Always return every requested dish id once in the items array using its exact id.',
].join(' ');

const DESCRIPTION_SCHEMA: AiJsonSchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      description: 'Generated descriptions keyed by dish id',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['id', 'description'],
      },
    },
  },
  required: ['items'],
};

@Injectable()
export class TravelDishDescriptionsService {
  constructor(
    private readonly db: Database,
    private readonly ai: AiService,
  ) {}

  async generateMissing(
    dishIds?: string[],
  ): Promise<GenerateTravelDishDescriptionsResultDto> {
    const rows = await this.db.travelDish.findMany({
      where: dishIds?.length
        ? { id: { in: dishIds } }
        : { OR: [{ description: null }, { description: '' }] },
      select: {
        id: true,
        name: true,
        description: true,
        cuisines: { select: { name: true } },
        categories: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const targets = rows.filter((row) => !row.description?.trim());
    const skipped = rows.length - targets.length;
    let updated = 0;
    let failed = 0;

    for (let i = 0; i < targets.length; i += BATCH_SIZE) {
      const batch = targets.slice(i, i + BATCH_SIZE);
      const validIds = new Set(batch.map((item) => item.id));
      const payload = batch.map((dish) => ({
        id: dish.id,
        name: dish.name,
        cuisines: dish.cuisines.map((c) => c.name),
        categories: dish.categories.map((c) => c.name),
      }));

      const generated = await this.ai.generateJson<{
        items?: { id?: string; description?: string }[];
      }>(
        'dish descriptions',
        JSON.stringify(payload),
        DESCRIPTION_SCHEMA,
        DESCRIPTION_SYSTEM_INSTRUCTION,
        { timeoutMs: 40_000, maxTokens: 2_048, temperature: 0.2 },
      );

      const updates = new Map<string, string>();
      for (const entry of generated?.items ?? []) {
        if (!entry.id || !validIds.has(entry.id)) continue;
        const text = entry.description?.trim().slice(0, TRAVEL_NOTE_MAX_LENGTH);
        if (text) updates.set(entry.id, text);
      }

      if (updates.size > 0) {
        await Promise.all(
          [...updates.entries()].map(([id, description]) =>
            this.db.travelDish.update({
              where: { id },
              data: { description },
            }),
          ),
        );
      }

      updated += updates.size;
      failed += batch.length - updates.size;
    }

    return { updated, skipped, failed };
  }
}
