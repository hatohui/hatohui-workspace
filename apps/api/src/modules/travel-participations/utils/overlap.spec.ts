import { rangesOverlap } from '@/modules/travel-participations/utils/overlap';

describe('rangesOverlap', () => {
  it('returns true when ranges overlap', () => {
    expect(
      rangesOverlap(
        new Date('2026-06-01T00:00:00Z'),
        new Date('2026-06-05T00:00:00Z'),
        new Date('2026-06-04T00:00:00Z'),
        new Date('2026-06-08T00:00:00Z'),
      ),
    ).toBe(true);
  });

  it('returns false when ranges only touch at boundary', () => {
    expect(
      rangesOverlap(
        new Date('2026-06-01T00:00:00Z'),
        new Date('2026-06-05T00:00:00Z'),
        new Date('2026-06-05T00:00:00Z'),
        new Date('2026-06-08T00:00:00Z'),
      ),
    ).toBe(false);
  });
});
