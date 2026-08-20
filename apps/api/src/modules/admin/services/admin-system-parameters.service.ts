import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Database } from '@/infra/db';
import { Cache, CACHE_KEYS } from '@/infra/cache';
import { ADMIN_EMAIL_CONFIG_TYPE } from '@/modules/auth/auth.constants';
import { SYSTEM_PARAMETERS_CACHE_TTL_SECONDS } from '@/modules/admin/admin.constants';
import {
  AdminSystemParameterDto,
  CreateAdminSystemParameterDto,
  UpdateAdminSystemParameterDto,
} from '@/modules/admin/dto/admin-system-parameter.dto';
import type { SystemParameters } from '@prisma/client';

@Injectable()
export class AdminSystemParametersService {
  constructor(
    private readonly db: Database,
    private readonly cache: Cache,
  ) {}

  async list(): Promise<AdminSystemParameterDto[]> {
    return this.cache.getOrSet(
      CACHE_KEYS.systemParametersList(),
      SYSTEM_PARAMETERS_CACHE_TTL_SECONDS,
      async () => {
        const rows = await this.db.systemParameters.findMany({
          orderBy: [{ scope: 'asc' }, { type: 'asc' }],
        });
        return rows.map((row) => this.toDto(row));
      },
    );
  }

  async create(
    dto: CreateAdminSystemParameterDto,
  ): Promise<AdminSystemParameterDto> {
    if (dto.type === ADMIN_EMAIL_CONFIG_TYPE) {
      throw new ForbiddenException(
        'The super-admin email is seed/DB-only and cannot be changed here',
      );
    }

    try {
      const row = await this.db.systemParameters.create({ data: dto });
      await this.cache.invalidate(CACHE_KEYS.systemParametersList());
      return this.toDto(row);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A parameter with this type and scope already exists',
        );
      }
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateAdminSystemParameterDto,
  ): Promise<AdminSystemParameterDto> {
    const existing = await this.db.systemParameters.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('System parameter not found');
    }
    if (existing.type === ADMIN_EMAIL_CONFIG_TYPE) {
      throw new ForbiddenException(
        'The super-admin email is seed/DB-only and cannot be changed here',
      );
    }

    const row = await this.db.systemParameters.update({
      where: { id },
      data: { value: dto.value },
    });
    await this.cache.invalidate(CACHE_KEYS.systemParametersList());

    return this.toDto(row);
  }

  private toDto(row: SystemParameters): AdminSystemParameterDto {
    return {
      id: row.id,
      type: row.type,
      scope: row.scope,
      value: row.value,
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
