import {
  countWorkingDaysFromRules,
  expandParticipationsToHeatmap,
} from '@/modules/travel-schedule/utils/working-days';
import { DEFAULT_WORK_DAYS } from '@/modules/travel-schedule/travel-schedule.constants';

describe('working-days', () => {
  describe('countWorkingDaysFromRules', () => {
    it('counts Mon-Fri by default and skips weekends', () => {
      const days = countWorkingDaysFromRules({
        from: new Date('2026-11-16T00:00:00.000Z'), // Mon
        to: new Date('2026-11-22T23:59:59.000Z'), // Sun
        workDays: DEFAULT_WORK_DAYS,
        exceptionMap: new Map(),
        customHolidaySet: new Set(),
        publicHolidaySet: new Set(),
      });
      expect(days).toBe(5);
    });

    it('enforces precedence: exception > custom holiday > public holiday > work schedule', () => {
      const days = countWorkingDaysFromRules({
        from: new Date('2026-11-16T00:00:00.000Z'), // Mon
        to: new Date('2026-11-22T00:00:00.000Z'), // Sun
        workDays: DEFAULT_WORK_DAYS,
        exceptionMap: new Map([
          ['2026-11-17', false], // Tue forced off
          ['2026-11-21', true], // Sat forced work even though weekend & custom holiday
        ]),
        customHolidaySet: new Set(['2026-11-18', '2026-11-21']), // Wed custom holiday
        publicHolidaySet: new Set(['2026-11-19']), // Thu public holiday
      });
      // Mon (work) + Tue (forced off) + Wed (custom holiday) + Thu (public holiday) + Fri (work) + Sat (forced work) + Sun (off) = 3
      expect(days).toBe(3);
    });

    it('handles cross-year boundaries inclusively', () => {
      const days = countWorkingDaysFromRules({
        from: new Date('2026-12-30T00:00:00.000Z'), // Wed
        to: new Date('2027-01-02T00:00:00.000Z'), // Sat
        workDays: DEFAULT_WORK_DAYS,
        exceptionMap: new Map(),
        customHolidaySet: new Set(),
        publicHolidaySet: new Set(['2027-01-01']),
      });
      // Dec 30 (Wed), Dec 31 (Thu) = 2; Jan 1 (public holiday), Jan 2 (Sat) skipped
      expect(days).toBe(2);
    });
  });

  describe('expandParticipationsToHeatmap', () => {
    it('expands partial and multi-day windows into UTC date intensities', () => {
      const entries = expandParticipationsToHeatmap([
        {
          from: new Date('2026-05-01T12:00:00.000Z'),
          to: new Date('2026-05-03T06:00:00.000Z'),
        },
      ]);
      expect(entries).toEqual([
        { date: '2026-05-01', intensity: 0.5 },
        { date: '2026-05-02', intensity: 1 },
        { date: '2026-05-03', intensity: 0.25 },
      ]);
    });
  });
});
