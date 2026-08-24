import { CommissionTypeSection } from '@/components/commission/CommissionTypeSection';
import { CommissionTypePricingSection } from '@/components/commission/CommissionTypePricingSection';
import { CommissionOptionPricingSection } from '@/components/commission/CommissionOptionPricingSection';
import { CommissionAddonPricingSection } from '@/components/commission/CommissionAddonPricingSection';
import { CommissionRushFeeSection } from '@/components/commission/CommissionRushFeeSection';
import { PricingPageTitle } from '@/components/commission/PricingPageTitle';

export default function AdminPricingPage() {
  return (
    <div className="space-y-8">
      <PricingPageTitle />
      <CommissionTypeSection />
      <CommissionTypePricingSection />
      <CommissionOptionPricingSection />
      <CommissionAddonPricingSection />
      <CommissionRushFeeSection />
    </div>
  );
}
