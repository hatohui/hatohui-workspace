import { Injectable, Logger } from '@nestjs/common';
import { AppScope } from '@prisma/client';
import { Database } from '@/infra/db';
import { Cache, CACHE_KEYS } from '@/infra/cache';
import {
  DEFAULT_MAX_IMAGES_PER_UPLOAD,
  DEFAULT_MAX_IMAGE_UPLOAD_BYTES,
  UPLOAD_LIMITS_CACHE_TTL_SECONDS,
  UPLOAD_LIMIT_PARAMETER_TYPES,
} from '@/modules/images/images.constants';
import type { ImageUploadLimitsDto } from '@/modules/images/dto/sign-image.dto';

@Injectable()
export class ImageUploadLimitsService {
  private readonly logger = new Logger(ImageUploadLimitsService.name);

  constructor(
    private readonly db: Database,
    private readonly cache: Cache,
  ) {}

  get(): Promise<ImageUploadLimitsDto> {
    return this.cache.getOrSet(
      CACHE_KEYS.imageUploadLimits(),
      UPLOAD_LIMITS_CACHE_TTL_SECONDS,
      () => this.load(),
    );
  }

  private async load(): Promise<ImageUploadLimitsDto> {
    const rows = await this.db.systemParameters.findMany({
      where: {
        scope: AppScope.ALL,
        type: { in: Object.values(UPLOAD_LIMIT_PARAMETER_TYPES) },
      },
      select: { type: true, value: true },
    });
    const values = new Map(rows.map((row) => [row.type, row.value]));

    return {
      maxBytes: this.positiveInt(
        values.get(UPLOAD_LIMIT_PARAMETER_TYPES.maxBytes),
        UPLOAD_LIMIT_PARAMETER_TYPES.maxBytes,
        DEFAULT_MAX_IMAGE_UPLOAD_BYTES,
      ),
      maxFiles: this.positiveInt(
        values.get(UPLOAD_LIMIT_PARAMETER_TYPES.maxFiles),
        UPLOAD_LIMIT_PARAMETER_TYPES.maxFiles,
        DEFAULT_MAX_IMAGES_PER_UPLOAD,
      ),
    };
  }

  private positiveInt(
    value: string | undefined,
    type: string,
    fallback: number,
  ): number {
    if (value === undefined) return fallback;
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
    this.logger.warn(
      `Ignoring SystemParameters ${type}: expected a positive integer, got "${value}"`,
    );
    return fallback;
  }
}
