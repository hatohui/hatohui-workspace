import { Injectable, NotFoundException } from '@nestjs/common';
import { TravelLeaveType } from '@prisma/client';
import { Database } from '@/infra/db';
import {
  AdminUpsertTravelJobProfileDto,
  TravelJobProfileDto,
  TravelLeaveBalanceDto,
  UpsertTravelJobProfileDto,
} from '@/modules/travel-job-profiles/dto/travel-job-profile.dto';
import { resolveLeaveCycle } from '@/modules/travel-job-profiles/utils/leave-cycle';
import { TravelScheduleService } from '@/modules/travel-schedule/services/travel-schedule.service';

const JOB_PROFILE_USER_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
  profile: {
    select: {
      displayName: true,
      handle: true,
      avatarUrl: true,
    },
  },
} as const;

type JobProfileRow = {
  id: string;
  userId: string;
  title: string | null;
  daysOfLeave: number;
  daysOfSickLeave: number;
  leaveCycleStart: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    avatarUrl: string | null;
    profile: {
      displayName: string;
      handle: string | null;
      avatarUrl: string | null;
    } | null;
  };
};

function toDto(row: JobProfileRow): TravelJobProfileDto {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    daysOfLeave: row.daysOfLeave,
    daysOfSickLeave: row.daysOfSickLeave,
    leaveCycleStart: row.leaveCycleStart.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...(row.user
      ? {
          user: {
            id: row.user.id,
            displayName: row.user.profile?.displayName ?? row.user.name,
            handle: row.user.profile?.handle ?? null,
            avatarUrl: row.user.profile?.avatarUrl ?? row.user.avatarUrl,
          },
        }
      : {}),
  };
}

@Injectable()
export class TravelJobProfilesService {
  constructor(
    private readonly db: Database,
    private readonly schedule: TravelScheduleService,
  ) {}

  async getMine(userId: string): Promise<TravelJobProfileDto | null> {
    const row = await this.db.travelJobProfile.findUnique({
      where: { userId },
    });
    return row ? toDto(row) : null;
  }

  async upsertMine(
    userId: string,
    dto: UpsertTravelJobProfileDto,
  ): Promise<TravelJobProfileDto> {
    const title = dto.title?.trim() || null;
    const leaveCycleStart = dto.leaveCycleStart
      ? new Date(dto.leaveCycleStart)
      : undefined;
    const row = await this.db.travelJobProfile.upsert({
      where: { userId },
      create: {
        userId,
        title,
        daysOfLeave: dto.daysOfLeave,
        daysOfSickLeave: dto.daysOfSickLeave,
        ...(leaveCycleStart ? { leaveCycleStart } : {}),
      },
      update: {
        title,
        daysOfLeave: dto.daysOfLeave,
        daysOfSickLeave: dto.daysOfSickLeave,
        ...(leaveCycleStart ? { leaveCycleStart } : {}),
      },
    });
    return toDto(row);
  }

  async confirmMine(userId: string): Promise<TravelJobProfileDto> {
    const existing = await this.db.travelJobProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Job profile not found');
    }
    const row = await this.db.travelJobProfile.update({
      where: { id: existing.id },
      data: { updatedAt: new Date() },
    });
    return toDto(row);
  }

  async getLeaveBalance(userId: string): Promise<TravelLeaveBalanceDto> {
    const profile = await this.db.travelJobProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Job profile not found');
    }

    const { cycleFrom, cycleTo } = resolveLeaveCycle(profile.leaveCycleStart);

    const [annualUsed, sickUsed] = await Promise.all([
      this.sumLeaveDays(userId, TravelLeaveType.ANNUAL, cycleFrom, cycleTo),
      this.sumLeaveDays(userId, TravelLeaveType.SICK, cycleFrom, cycleTo),
    ]);

    return {
      annual: {
        total: profile.daysOfLeave,
        used: annualUsed,
        remaining: profile.daysOfLeave - annualUsed,
      },
      sick: {
        total: profile.daysOfSickLeave,
        used: sickUsed,
        remaining: profile.daysOfSickLeave - sickUsed,
      },
      cycleFrom: cycleFrom.toISOString(),
      cycleTo: cycleTo.toISOString(),
    };
  }

  async listAll(): Promise<TravelJobProfileDto[]> {
    const rows = await this.db.travelJobProfile.findMany({
      include: { user: { select: JOB_PROFILE_USER_SELECT } },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(toDto);
  }

  async adminUpsert(
    dto: AdminUpsertTravelJobProfileDto,
  ): Promise<TravelJobProfileDto> {
    const userExists = await this.db.user.findUnique({
      where: { id: dto.userId },
      select: { id: true },
    });
    if (!userExists) {
      throw new NotFoundException('User not found');
    }
    const title = dto.title?.trim() || null;
    const leaveCycleStart = dto.leaveCycleStart
      ? new Date(dto.leaveCycleStart)
      : undefined;
    const row = await this.db.travelJobProfile.upsert({
      where: { userId: dto.userId },
      create: {
        userId: dto.userId,
        title,
        daysOfLeave: dto.daysOfLeave,
        daysOfSickLeave: dto.daysOfSickLeave,
        ...(leaveCycleStart ? { leaveCycleStart } : {}),
      },
      update: {
        title,
        daysOfLeave: dto.daysOfLeave,
        daysOfSickLeave: dto.daysOfSickLeave,
        ...(leaveCycleStart ? { leaveCycleStart } : {}),
      },
      include: { user: { select: JOB_PROFILE_USER_SELECT } },
    });
    return toDto(row);
  }

  async adminUpdateById(
    id: string,
    dto: UpsertTravelJobProfileDto,
  ): Promise<TravelJobProfileDto> {
    const existing = await this.db.travelJobProfile.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Job profile not found');
    }
    const title = dto.title?.trim() || null;
    const leaveCycleStart = dto.leaveCycleStart
      ? new Date(dto.leaveCycleStart)
      : undefined;
    const row = await this.db.travelJobProfile.update({
      where: { id },
      data: {
        title,
        daysOfLeave: dto.daysOfLeave,
        daysOfSickLeave: dto.daysOfSickLeave,
        ...(leaveCycleStart ? { leaveCycleStart } : {}),
      },
      include: { user: { select: JOB_PROFILE_USER_SELECT } },
    });
    return toDto(row);
  }

  async adminRemoveById(id: string): Promise<void> {
    const result = await this.db.travelJobProfile.deleteMany({ where: { id } });
    if (result.count === 0) {
      throw new NotFoundException('Job profile not found');
    }
  }

  private async sumLeaveDays(
    userId: string,
    leaveType: TravelLeaveType,
    cycleFrom: Date,
    cycleTo: Date,
  ): Promise<number> {
    const participations = await this.db.travelParticipation.findMany({
      where: {
        userId,
        leaveType,
        from: { gte: cycleFrom },
        to: { lte: cycleTo },
      },
      select: { from: true, to: true },
    });
    const counts = await Promise.all(
      participations.map((p) =>
        this.schedule.countWorkingDays(userId, p.from, p.to),
      ),
    );
    return counts.reduce((sum, days) => sum + days, 0);
  }
}
