import { resolveLeaveCycle } from '@/modules/travel-job-profiles/utils/leave-cycle';

describe('resolveLeaveCycle', () => {
  it('advances an older anchor to the active 1-year cycle', () => {
    const { cycleFrom, cycleTo } = resolveLeaveCycle(
      new Date('2023-04-01T00:00:00.000Z'),
      new Date('2026-11-22T00:00:00.000Z'),
    );
    expect(cycleFrom.toISOString()).toBe('2026-04-01T00:00:00.000Z');
    expect(cycleTo.toISOString()).toBe('2027-04-01T00:00:00.000Z');
  });

  it('rolls into the new cycle on the exact anniversary timestamp', () => {
    const { cycleFrom, cycleTo } = resolveLeaveCycle(
      new Date('2025-01-01T00:00:00.000Z'),
      new Date('2026-01-01T00:00:00.000Z'),
    );
    expect(cycleFrom.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(cycleTo.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });

  it('steps back if the anchor is in the future', () => {
    const { cycleFrom, cycleTo } = resolveLeaveCycle(
      new Date('2027-03-01T00:00:00.000Z'),
      new Date('2026-11-22T00:00:00.000Z'),
    );
    expect(cycleFrom.toISOString()).toBe('2026-03-01T00:00:00.000Z');
    expect(cycleTo.toISOString()).toBe('2027-03-01T00:00:00.000Z');
  });
});
