import { Injectable } from '@nestjs/common';
import { AppScope } from '@prisma/client';
import Holidays from 'date-holidays';
import { Cache, CACHE_KEYS } from '@/infra/cache';
import { UserSettingsService } from '@/modules/user-settings/services/user-settings.service';
import {
  DEFAULT_TRAVEL_COUNTRY,
  HOLIDAY_CACHE_TTL_SECONDS,
  PUBLIC_HOLIDAY_TYPES,
  TRAVEL_COUNTRY_SETTING_KEY,
} from '@/modules/travel-schedule/travel-schedule.constants';
import { TravelPublicHolidayDto } from '@/modules/travel-schedule/dto/travel-schedule.dto';

@Injectable()
export class TravelHolidaysService {
  constructor(
    private readonly cache: Cache,
    private readonly userSettings: UserSettingsService,
  ) {}

  async getUserCountry(userId: string): Promise<string> {
    const stored = await this.userSettings.get(
      userId,
      AppScope.TRAVEL,
      TRAVEL_COUNTRY_SETTING_KEY,
    );
    return stored ? stored.toUpperCase() : DEFAULT_TRAVEL_COUNTRY;
  }

  async setUserCountry(userId: string, country: string): Promise<string> {
    const normalized = country.trim().toUpperCase();
    await this.userSettings.set(
      userId,
      AppScope.TRAVEL,
      TRAVEL_COUNTRY_SETTING_KEY,
      normalized,
    );
    return normalized;
  }

  async getPublicHolidaysForYear(
    country: string,
    year: number,
  ): Promise<TravelPublicHolidayDto[]> {
    const code = country.toUpperCase();
    return this.cache.getOrSet(
      CACHE_KEYS.travelHolidays(code, year),
      HOLIDAY_CACHE_TTL_SECONDS,
      () => {
        const hd = new Holidays(code);
        const raw = hd.getHolidays(year) ?? [];
        return Promise.resolve(
          raw
            .filter((h) => PUBLIC_HOLIDAY_TYPES.has(h.type))
            .map((h) => ({
              date: h.date.slice(0, 10),
              name: h.name,
              type: h.type,
              country: code,
            })),
        );
      },
    );
  }

  async getPublicHolidaySet(
    country: string,
    years: number[],
  ): Promise<Set<string>> {
    const uniqueYears = Array.from(new Set(years));
    const lists = await Promise.all(
      uniqueYears.map((year) => this.getPublicHolidaysForYear(country, year)),
    );
    const set = new Set<string>();
    for (const entries of lists) {
      for (const entry of entries) set.add(entry.date);
    }
    return set;
  }
}
