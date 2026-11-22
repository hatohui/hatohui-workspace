import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '@/infra/db';
import { DEFAULT_WORK_DAYS } from '@/modules/travel-schedule/travel-schedule.constants';
import {
  CreateTravelCustomHolidayDto,
  CreateTravelScheduleExceptionDto,
  TravelCustomHolidayDto,
  TravelHeatmapEntryDto,
  TravelPublicHolidayDto,
  TravelScheduleExceptionDto,
  TravelWorkScheduleDto,
  UpsertTravelWorkScheduleDto,
} from '@/modules/travel-schedule/dto/travel-schedule.dto';
import { TravelHolidaysService } from '@/modules/travel-schedule/services/travel-holidays.service';
import {
  countWorkingDaysFromRules,
  expandParticipationsToHeatmap,
  formatUtcDateKey,
  parseUtcDateOnly,
} from '@/modules/travel-schedule/utils/working-days';

@Injectable()
export class TravelScheduleService {
  constructor(
    private readonly db: Database,
    private readonly holidays: TravelHolidaysService,
  ) {}

  async getWorkSchedule(userId: string): Promise<TravelWorkScheduleDto> {
    const row = await this.db.travelWorkSchedule.findUnique({
      where: { userId },
    });
    if (!row) {
      return {
        sunday: DEFAULT_WORK_DAYS[0],
        monday: DEFAULT_WORK_DAYS[1],
        tuesday: DEFAULT_WORK_DAYS[2],
        wednesday: DEFAULT_WORK_DAYS[3],
        thursday: DEFAULT_WORK_DAYS[4],
        friday: DEFAULT_WORK_DAYS[5],
        saturday: DEFAULT_WORK_DAYS[6],
      };
    }
    return {
      sunday: row.sunday,
      monday: row.monday,
      tuesday: row.tuesday,
      wednesday: row.wednesday,
      thursday: row.thursday,
      friday: row.friday,
      saturday: row.saturday,
    };
  }

  async upsertWorkSchedule(
    userId: string,
    dto: UpsertTravelWorkScheduleDto,
  ): Promise<TravelWorkScheduleDto> {
    const row = await this.db.travelWorkSchedule.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: { ...dto },
    });
    return {
      sunday: row.sunday,
      monday: row.monday,
      tuesday: row.tuesday,
      wednesday: row.wednesday,
      thursday: row.thursday,
      friday: row.friday,
      saturday: row.saturday,
    };
  }

  async listExceptions(userId: string): Promise<TravelScheduleExceptionDto[]> {
    const rows = await this.db.travelScheduleException.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
    return rows.map((row) => ({
      id: row.id,
      date: formatUtcDateKey(row.date),
      isWorkDay: row.isWorkDay,
      reason: row.reason,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async upsertException(
    userId: string,
    dto: CreateTravelScheduleExceptionDto,
  ): Promise<TravelScheduleExceptionDto> {
    const date = parseUtcDateOnly(dto.date);
    const reason = dto.reason?.trim() || null;
    const row = await this.db.travelScheduleException.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, isWorkDay: dto.isWorkDay, reason },
      update: { isWorkDay: dto.isWorkDay, reason },
    });
    return {
      id: row.id,
      date: formatUtcDateKey(row.date),
      isWorkDay: row.isWorkDay,
      reason: row.reason,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async deleteException(userId: string, id: string): Promise<void> {
    const result = await this.db.travelScheduleException.deleteMany({
      where: { id, userId },
    });
    if (result.count === 0) {
      throw new NotFoundException('Schedule exception not found');
    }
  }

  async listCustomHolidays(userId: string): Promise<TravelCustomHolidayDto[]> {
    const rows = await this.db.travelCustomHoliday.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
    return rows.map((row) => ({
      id: row.id,
      date: formatUtcDateKey(row.date),
      name: row.name,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async upsertCustomHoliday(
    userId: string,
    dto: CreateTravelCustomHolidayDto,
  ): Promise<TravelCustomHolidayDto> {
    const date = parseUtcDateOnly(dto.date);
    const name = dto.name.trim();
    const row = await this.db.travelCustomHoliday.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, name },
      update: { name },
    });
    return {
      id: row.id,
      date: formatUtcDateKey(row.date),
      name: row.name,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async deleteCustomHoliday(userId: string, id: string): Promise<void> {
    const result = await this.db.travelCustomHoliday.deleteMany({
      where: { id, userId },
    });
    if (result.count === 0) {
      throw new NotFoundException('Custom holiday not found');
    }
  }

  async getPublicHolidaysInRange(
    userId: string,
    fromIso: string,
    toIso: string,
  ): Promise<TravelPublicHolidayDto[]> {
    const country = await this.holidays.getUserCountry(userId);
    const fromKey = fromIso.slice(0, 10);
    const toKey = toIso.slice(0, 10);
    const fromYear = Number(fromKey.slice(0, 4));
    const toYear = Number(toKey.slice(0, 4));
    if (Number.isNaN(fromYear) || Number.isNaN(toYear) || toYear < fromYear) {
      return [];
    }

    const years: number[] = [];
    for (let y = fromYear; y <= toYear; y++) years.push(y);

    const lists = await Promise.all(
      years.map((year) =>
        this.holidays.getPublicHolidaysForYear(country, year),
      ),
    );
    return lists
      .flat()
      .filter((entry) => entry.date >= fromKey && entry.date <= toKey);
  }

  async getHeatmap(
    userId: string,
    fromIso: string,
    toIso: string,
  ): Promise<TravelHeatmapEntryDto[]> {
    const from = new Date(fromIso);
    const to = new Date(toIso);
    const participations = await this.db.travelParticipation.findMany({
      where: {
        userId,
        from: { lte: to },
        to: { gte: from },
      },
      select: { from: true, to: true },
    });
    return expandParticipationsToHeatmap(participations);
  }

  async countWorkingDays(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    const fromDateOnly = parseUtcDateOnly(formatUtcDateKey(from));
    const toDateOnly = parseUtcDateOnly(formatUtcDateKey(to));
    const years: number[] = [];
    for (
      let y = fromDateOnly.getUTCFullYear();
      y <= toDateOnly.getUTCFullYear();
      y++
    ) {
      years.push(y);
    }

    const [schedule, country, exceptions, customHolidays] = await Promise.all([
      this.getWorkSchedule(userId),
      this.holidays.getUserCountry(userId),
      this.db.travelScheduleException.findMany({
        where: { userId, date: { gte: fromDateOnly, lte: toDateOnly } },
        select: { date: true, isWorkDay: true },
      }),
      this.db.travelCustomHoliday.findMany({
        where: { userId, date: { gte: fromDateOnly, lte: toDateOnly } },
        select: { date: true },
      }),
    ]);

    const publicHolidaySet = await this.holidays.getPublicHolidaySet(
      country,
      years,
    );

    const exceptionMap = new Map<string, boolean>(
      exceptions.map((e) => [formatUtcDateKey(e.date), e.isWorkDay]),
    );
    const customHolidaySet = new Set<string>(
      customHolidays.map((h) => formatUtcDateKey(h.date)),
    );
    const workDays = [
      schedule.sunday,
      schedule.monday,
      schedule.tuesday,
      schedule.wednesday,
      schedule.thursday,
      schedule.friday,
      schedule.saturday,
    ];

    return countWorkingDaysFromRules({
      from,
      to,
      workDays,
      exceptionMap,
      customHolidaySet,
      publicHolidaySet,
    });
  }
}
