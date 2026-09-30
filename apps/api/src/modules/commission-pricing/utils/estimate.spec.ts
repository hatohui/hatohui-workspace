import { estimateCommission } from '@/modules/commission-pricing/utils/estimate';
import type { CommissionPricingDto } from '@/modules/commission-pricing/dto/commission-pricing.dto';

const pricing = {
  options: [
    {
      key: 'flat',
      commissionTypeId: 'type-1',
      priceMode: 'FIXED',
      minPrice: 4000,
      maxPrice: null,
    },
  ],
  addons: [],
  rushFee: null,
  privateFee: 1500,
  galleryPostDefault: true,
  currency: 'USD',
} as unknown as CommissionPricingDto;

const selection = { commissionTypeId: 'type-1', optionKey: 'flat' };

describe('estimateCommission private fee', () => {
  it('adds the private fee only when gallery posting is refused', () => {
    expect(
      estimateCommission(pricing, { ...selection, allowGalleryPost: false }),
    ).toEqual({ low: 5500, high: 5500 });
    expect(
      estimateCommission(pricing, { ...selection, allowGalleryPost: true }),
    ).toEqual({ low: 4000, high: 4000 });
    expect(estimateCommission(pricing, selection)).toEqual({
      low: 4000,
      high: 4000,
    });
  });

  it('adds nothing when the artist sets no private fee', () => {
    expect(
      estimateCommission(
        { ...pricing, privateFee: null },
        { ...selection, allowGalleryPost: false },
      ),
    ).toEqual({ low: 4000, high: 4000 });
  });
});
