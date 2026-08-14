import {
  civilDateIn,
  formatCivilDate,
  nextOccurrence,
} from './birthday-schedule';

describe('civilDateIn', () => {
  it('resolves the same instant to different days per zone', () => {
    const instant = new Date('2026-08-14T20:00:00Z');

    expect(formatCivilDate(civilDateIn(instant, 'Pacific/Auckland'))).toBe(
      '2026-08-15',
    );
    expect(formatCivilDate(civilDateIn(instant, 'America/Los_Angeles'))).toBe(
      '2026-08-14',
    );
  });
});

describe('nextOccurrence', () => {
  const today = { year: 2026, month: 8, day: 14 };

  it('counts the birthday itself as zero days away', () => {
    expect(nextOccurrence(today, 8, 14).daysUntil).toBe(0);
  });

  it('counts days to a birthday later this year', () => {
    const { daysUntil, occursOn } = nextOccurrence(today, 8, 21);
    expect(daysUntil).toBe(7);
    expect(formatCivilDate(occursOn)).toBe('2026-08-21');
  });

  it('rolls a passed birthday into next year', () => {
    const { occursOn } = nextOccurrence(today, 1, 5);
    expect(formatCivilDate(occursOn)).toBe('2027-01-05');
  });

  it('spans the year boundary without a negative count', () => {
    const newYearsEve = { year: 2026, month: 12, day: 31 };
    const { daysUntil, occursOn } = nextOccurrence(newYearsEve, 1, 3);
    expect(daysUntil).toBe(3);
    expect(formatCivilDate(occursOn)).toBe('2027-01-03');
  });

  it('celebrates Feb 29 on the 28th in a common year', () => {
    const { daysUntil, occursOn } = nextOccurrence(
      { year: 2027, month: 2, day: 21 },
      2,
      29,
    );
    expect(daysUntil).toBe(7);
    expect(formatCivilDate(occursOn)).toBe('2027-02-28');
  });

  it('keeps Feb 29 on the 29th in a leap year', () => {
    const { occursOn } = nextOccurrence(
      { year: 2028, month: 2, day: 1 },
      2,
      29,
    );
    expect(formatCivilDate(occursOn)).toBe('2028-02-29');
  });

  it('is unaffected by a DST transition in the window', () => {
    const beforeSpringForward = { year: 2027, month: 3, day: 10 };
    expect(nextOccurrence(beforeSpringForward, 3, 17).daysUntil).toBe(7);
  });
});
