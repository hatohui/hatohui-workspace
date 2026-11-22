import { randomUUID } from 'node:crypto';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Database } from '@/infra/db';
import { RedisClient } from '@/infra/redis';
import { AiService, type AiJsonSchema } from '@/modules/ai/services/ai.service';
import { isTextInLocaleScript } from '@/modules/ai/utils/locale-script';
import {
  GenerateTravelDishDescriptionsResultDto,
  type TravelDishDescriptionBatchProgressDto,
  type TravelDishDescriptionErrorDto,
  type TravelDishDescriptionJobsDto,
  type TravelDishDescriptionLastBatchErrorsDto,
} from '@/modules/travel-dishes/dto/travel-dish.dto';
import { TRAVEL_NOTE_MAX_LENGTH } from '@/modules/travel-recommendations/travel-recommendations.constants';

const BATCH_SIZE = 10;
const MAX_BATCH_ERRORS = 50;
const BATCH_TTL_SECONDS = 45 * 60;
const FAILED_TTL_SECONDS = 30 * 60;
const BATCH_KEY = 'travel:dish-descriptions:batch';
const BATCH_ERRORS_KEY = 'travel:dish-descriptions:batch-errors';

const DESCRIPTION_SYSTEM_INSTRUCTION = [
  'You write concise, appetizing English culinary descriptions for a travel food catalog.',
  'For each dish, write one short phrase (3 to 12 words, e.g. "Vietnamese crispy savory pancake" or "Steamed rice rolls filled with seasoned pork and mushrooms") explaining what the dish is to a traveler.',
  'Only state ingredients, cooking methods, and flavours clearly implied by the dish name, cuisine, or category; never invent prices, portion sizes, or unstated heat levels.',
  'Use natural English and keep traditional dish or brand names accurate.',
  'Always return every requested dish id once in the items array using its exact id.',
].join(' ');

const BATCH_DESCRIPTION_SCHEMA: AiJsonSchema = {
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

const SINGLE_DESCRIPTION_SCHEMA: AiJsonSchema = {
  type: 'object',
  properties: {
    description: {
      type: 'string',
      description:
        'A concise 3 to 12 word English description of the dish for a travel food catalog.',
    },
  },
  required: ['description'],
};

interface DishTarget {
  id: string;
  name: string;
  cuisines: { name: string }[];
  categories: { name: string }[];
}

@Injectable()
export class TravelDishDescriptionsService {
  private readonly logger = new Logger(TravelDishDescriptionsService.name);

  constructor(
    private readonly db: Database,
    private readonly redis: RedisClient,
    private readonly ai: AiService,
  ) {}

  async jobs(): Promise<TravelDishDescriptionJobsDto> {
    const [batch, lastBatchErrors] = await Promise.all([
      this.getBatch(),
      this.getLastBatchErrors(),
    ]);
    return { batch, lastBatchErrors };
  }

  async startBatch(
    dishIds?: string[],
  ): Promise<TravelDishDescriptionBatchProgressDto> {
    if (await this.getBatch()) {
      throw new ConflictException('An AI description batch is already running');
    }

    const targets = await this.findTargets(dishIds);
    const progress: TravelDishDescriptionBatchProgressDto = {
      id: randomUUID(),
      total: targets.length,
      done: 0,
      failed: 0,
      errors: [],
    };
    if (targets.length === 0) return progress;

    await Promise.all([
      this.setBatch(progress),
      this.deleteKey(BATCH_ERRORS_KEY),
    ]);

    void this.runBatch(progress.id, targets).catch((err) => {
      this.logger.error('Failed running dish description batch', err);
      void this.deleteKey(BATCH_KEY);
    });

    return progress;
  }

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
    if (targets.length === 0) {
      return { updated: 0, skipped, failed: 0, errors: [] };
    }

    let updated = 0;
    const errors: TravelDishDescriptionErrorDto[] = [];

    for (let i = 0; i < targets.length; i += BATCH_SIZE) {
      const batch = targets.slice(i, i + BATCH_SIZE);
      const outcome = await this.executeGroup(batch);
      updated += outcome.updated;
      errors.push(...outcome.errors);
    }

    if (dishIds?.length === 1) {
      await this.syncSingleRetryOutcome(dishIds[0], errors[0] ?? null);
    }

    return {
      updated,
      skipped,
      failed: errors.length,
      errors,
    };
  }

  private async findTargets(dishIds?: string[]): Promise<DishTarget[]> {
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
    return rows.filter((row) => !row.description?.trim());
  }

  private async runBatch(batchId: string, targets: DishTarget[]) {
    for (let i = 0; i < targets.length; i += BATCH_SIZE) {
      const current = await this.getBatch();
      if (current?.id !== batchId) return;

      const group = targets.slice(i, i + BATCH_SIZE);
      const outcome = await this.executeGroup(group);
      const errors = [...current.errors, ...outcome.errors].slice(
        0,
        MAX_BATCH_ERRORS,
      );

      if (errors.length > 0) {
        await this.setLastBatchErrors({ batchId, errors });
      }

      await this.setBatch({
        ...current,
        done: current.done + group.length,
        failed: current.failed + outcome.errors.length,
        errors,
      });
    }

    await this.deleteKey(BATCH_KEY);
  }

  private async executeGroup(group: DishTarget[]): Promise<{
    updated: number;
    errors: TravelDishDescriptionErrorDto[];
  }> {
    let updated = 0;
    const errors: TravelDishDescriptionErrorDto[] = [];
    const batchResult = await this.requestBatch(group);

    for (const dish of group) {
      if (!dish.name.trim()) {
        errors.push({
          id: dish.id,
          name: dish.name || dish.id,
          error: 'Dish has no source name',
        });
        continue;
      }

      const reasons: string[] = [];
      let description = this.validateDescription(
        dish,
        batchResult?.get(dish.id),
        reasons,
      );

      if (!description) {
        reasons.length = 0;
        description = await this.draftSingleDish(dish, reasons);
      }

      if (!description) {
        errors.push({
          id: dish.id,
          name: dish.name,
          error: reasons.join('; ') || 'AI returned no usable content',
        });
        continue;
      }

      try {
        await this.db.travelDish.update({
          where: { id: dish.id },
          data: { description },
        });
        updated++;
      } catch (err) {
        errors.push({
          id: dish.id,
          name: dish.name,
          error:
            err instanceof Error ? err.message : 'No fields could be saved',
        });
      }
    }

    return { updated, errors };
  }

  private async syncSingleRetryOutcome(
    dishId: string,
    failure: TravelDishDescriptionErrorDto | null,
  ) {
    const last = await this.getLastBatchErrors();
    if (!last) return;
    const nextErrors = failure
      ? last.errors.map((err) => (err.id === dishId ? failure : err))
      : last.errors.filter((err) => err.id !== dishId);
    if (nextErrors.length === 0) {
      await this.deleteKey(BATCH_ERRORS_KEY);
    } else {
      await this.setLastBatchErrors({
        batchId: last.batchId,
        errors: nextErrors,
      });
    }
  }

  private async getBatch(): Promise<TravelDishDescriptionBatchProgressDto | null> {
    try {
      const raw = await this.redis.get(BATCH_KEY);
      return raw
        ? (JSON.parse(raw) as TravelDishDescriptionBatchProgressDto)
        : null;
    } catch {
      return null;
    }
  }

  private async setBatch(progress: TravelDishDescriptionBatchProgressDto) {
    try {
      await this.redis.set(
        BATCH_KEY,
        JSON.stringify(progress),
        'EX',
        BATCH_TTL_SECONDS,
      );
    } catch {
      // Non-fatal if Redis is temporarily unavailable
    }
  }

  private async getLastBatchErrors(): Promise<TravelDishDescriptionLastBatchErrorsDto | null> {
    try {
      const raw = await this.redis.get(BATCH_ERRORS_KEY);
      return raw
        ? (JSON.parse(raw) as TravelDishDescriptionLastBatchErrorsDto)
        : null;
    } catch {
      return null;
    }
  }

  private async setLastBatchErrors(
    payload: TravelDishDescriptionLastBatchErrorsDto,
  ) {
    try {
      await this.redis.set(
        BATCH_ERRORS_KEY,
        JSON.stringify(payload),
        'EX',
        FAILED_TTL_SECONDS,
      );
    } catch {
      // Non-fatal
    }
  }

  private async deleteKey(key: string) {
    try {
      await this.redis.del(key);
    } catch {
      // Non-fatal
    }
  }

  private toPayload(dish: DishTarget) {
    return {
      id: dish.id,
      name: dish.name,
      cuisines: dish.cuisines.map((c) => c.name),
      categories: dish.categories.map((c) => c.name),
    };
  }

  private async requestBatch(
    batch: DishTarget[],
  ): Promise<Map<string, string> | null> {
    if (batch.length === 1) {
      const single = await this.ai.generateJson<{ description?: string }>(
        'dish description',
        JSON.stringify(this.toPayload(batch[0])),
        SINGLE_DESCRIPTION_SCHEMA,
        DESCRIPTION_SYSTEM_INSTRUCTION,
        { timeoutMs: 14_000, maxTokens: 512, temperature: 0.2 },
      );
      if (!single) return null;
      return new Map([[batch[0].id, single.description ?? '']]);
    }

    const generated = await this.ai.generateJson<{
      items?: { id?: string; description?: string }[];
    }>(
      `descriptions for ${batch.length} dishes`,
      JSON.stringify(batch.map((dish) => this.toPayload(dish))),
      BATCH_DESCRIPTION_SCHEMA,
      DESCRIPTION_SYSTEM_INSTRUCTION,
      { timeoutMs: 35_000, maxTokens: 2_048, temperature: 0.2 },
    );
    if (!generated?.items) return null;

    const map = new Map<string, string>();
    for (const entry of generated.items) {
      if (entry.id) map.set(entry.id, entry.description ?? '');
    }
    return map;
  }

  private async draftSingleDish(
    dish: DishTarget,
    reasons: string[],
  ): Promise<string | null> {
    const generated = await this.ai.generateJson<{ description?: string }>(
      'dish description retry',
      JSON.stringify(this.toPayload(dish)),
      SINGLE_DESCRIPTION_SCHEMA,
      DESCRIPTION_SYSTEM_INSTRUCTION,
      { timeoutMs: 18_000, maxTokens: 512, temperature: 0.35 },
    );
    if (!generated) {
      reasons.push('AI request timed out or returned no response');
      return null;
    }
    return this.validateDescription(dish, generated.description, reasons);
  }

  private validateDescription(
    dish: DishTarget,
    raw: string | undefined,
    reasons: string[],
  ): string | null {
    if (raw === undefined) {
      reasons.push('AI omitted dish from batch response');
      return null;
    }
    const text = raw.trim().slice(0, TRAVEL_NOTE_MAX_LENGTH);
    if (!text) {
      reasons.push('AI returned an empty description');
      return null;
    }
    if (!isTextInLocaleScript(text, 'en', true)) {
      reasons.push('en description was in the wrong language');
      return null;
    }
    if (text.toLowerCase() === dish.name.trim().toLowerCase()) {
      reasons.push('AI echoed the dish name without describing it');
      return null;
    }
    if (text.split(/\s+/).length < 2) {
      reasons.push('Description was too short');
      return null;
    }
    return text;
  }
}
