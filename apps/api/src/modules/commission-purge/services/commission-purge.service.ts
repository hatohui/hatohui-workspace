import { Injectable } from '@nestjs/common';
import { ProcessType } from '@prisma/client';
import { USER_SETTING_TYPES } from '@/modules/user-settings/user-settings.constants';
import { Database } from '@/infra/db';
import { UserSettingsService } from '@/modules/user-settings/services/user-settings.service';
import { ProcessQueueService } from '@/modules/process-queue/services/process-queue.service';
import { DEFAULT_COMMISSION_RETENTION_DAYS } from '@/modules/commission-purge/commission-purge.constants';

const DAY_MS = 86_400_000;

@Injectable()
export class CommissionPurgeService {
  constructor(
    private readonly db: Database,
    private readonly userSettings: UserSettingsService,
    private readonly processQueue: ProcessQueueService,
  ) {}

  async schedule(artistId: string, commissionId: string): Promise<void> {
    const days = await this.retentionDays(artistId);
    await this.processQueue.schedule(
      ProcessType.COMMISSION_PURGE,
      commissionId,
      new Date(Date.now() + days * DAY_MS),
    );
  }

  async purgeAtFor(commissionId: string): Promise<Date | null> {
    const job = await this.processQueue.findFor(
      ProcessType.COMMISSION_PURGE,
      commissionId,
    );
    return job?.nextAttemptAt ?? null;
  }

  async rescheduleAll(artistId: string, days: number): Promise<void> {
    const commissions = await this.db.commission.findMany({
      where: { artistId, status: 'COMPLETED', purgedAt: null },
      select: {
        id: true,
        updatedAt: true,
        history: {
          where: { toStatus: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
      },
    });
    for (const commission of commissions) {
      const completedAt =
        commission.history[0]?.createdAt ?? commission.updatedAt;
      await this.processQueue.schedule(
        ProcessType.COMMISSION_PURGE,
        commission.id,
        new Date(completedAt.getTime() + days * DAY_MS),
      );
    }
  }

  cancel(commissionId: string): Promise<void> {
    return this.processQueue.clearForRef(
      ProcessType.COMMISSION_PURGE,
      commissionId,
    );
  }

  async retentionDays(artistId: string): Promise<number> {
    const setting = USER_SETTING_TYPES.commissionRetentionDays;
    const value = await this.userSettings.get(
      artistId,
      setting.scope,
      setting.type,
    );
    const days = Number(value);
    return Number.isInteger(days) && days > 0
      ? days
      : DEFAULT_COMMISSION_RETENTION_DAYS;
  }
}
