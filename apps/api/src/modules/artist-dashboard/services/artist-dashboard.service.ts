import { Injectable } from '@nestjs/common';
import { CommissionStatus } from '@prisma/client';
import { Database } from '@/infra/db';
import { CommissionsService } from '@/modules/commissions/services/commissions.service';
import { CommissionOpeningsService } from '@/modules/commission-openings/services/commission-openings.service';
import {
  DASHBOARD_LIST_SIZE,
  IN_PROGRESS_STATUSES,
} from '@/modules/artist-dashboard/artist-dashboard.constants';
import { ArtistDashboardDto } from '@/modules/artist-dashboard/dto/artist-dashboard.dto';

@Injectable()
export class ArtistDashboardService {
  constructor(
    private readonly db: Database,
    private readonly commissions: CommissionsService,
    private readonly openings: CommissionOpeningsService,
  ) {}

  async get(artistId: string): Promise<ArtistDashboardDto> {
    const now = new Date();
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );

    const [
      byStatus,
      paid,
      inProgressValue,
      currency,
      opening,
      recentRequests,
      upcomingDeadlines,
    ] = await Promise.all([
      this.db.commission.groupBy({
        by: ['status'],
        where: { artistId },
        _count: { _all: true },
      }),
      this.db.commissionDetail.aggregate({
        where: {
          commission: { artistId },
          paymentConfirmedAt: { gte: monthStart },
        },
        _sum: { quote: true },
      }),
      this.db.commissionDetail.aggregate({
        where: {
          commission: { artistId, status: { in: IN_PROGRESS_STATUSES } },
        },
        _sum: { quote: true },
      }),
      this.commissions.currencyFor(artistId),
      this.openings.getCurrent(artistId),
      this.commissions.recent(artistId, DASHBOARD_LIST_SIZE),
      this.commissions.upcomingDeadlines(
        artistId,
        IN_PROGRESS_STATUSES,
        DASHBOARD_LIST_SIZE,
      ),
    ]);

    const countOf = (statuses: CommissionStatus[]) =>
      byStatus
        .filter((row) => statuses.includes(row.status))
        .reduce((sum, row) => sum + row._count._all, 0);

    return {
      currency,
      counts: {
        pending: countOf([CommissionStatus.PENDING]),
        inProgress: countOf(IN_PROGRESS_STATUSES),
        completed: countOf([CommissionStatus.COMPLETED]),
        total: byStatus.reduce((sum, row) => sum + row._count._all, 0),
      },
      earnings: {
        paidThisMonth: paid._sum.quote ?? 0,
        inProgressValue: inProgressValue._sum.quote ?? 0,
      },
      opening,
      recentRequests,
      upcomingDeadlines,
    };
  }
}
