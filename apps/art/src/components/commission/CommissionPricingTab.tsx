'use client';

import { useTranslation } from '@hatohui/i18n';
import { PRICING_SECTIONS } from '@/constants/commission';
import { AutosaveIndicator } from '@/components/shared/AutosaveIndicator';
import { CommissionTypesEditor } from './CommissionTypesEditor';
import { CommissionAddonPricingSection } from './CommissionAddonPricingSection';
import { CommissionRushFeeSection } from './CommissionRushFeeSection';
import { CommissionPricingPreview } from './CommissionPricingPreview';

const sectionId = (section: string) => `pricing-${section}`;

export function CommissionPricingTab({ artistId }: { artistId: string }) {
  const { t } = useTranslation('art');

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0 space-y-10">
        <nav
          aria-label={t('app.commissionSettings.jumpTo')}
          className="flex flex-wrap items-center gap-2"
        >
          {PRICING_SECTIONS.map((section) => (
            <a
              key={section}
              href={`#${sectionId(section)}`}
              className="rounded-full border border-border px-3 py-1 text-sm transition-colors duration-200 hover:bg-muted motion-reduce:transition-none"
            >
              {t(`app.commissionSettings.${section}`)}
            </a>
          ))}
          <AutosaveIndicator className="ml-auto" />
        </nav>

        <section id={sectionId('types')} className="scroll-mt-20 space-y-3">
          <h2 className="font-medium">{t('app.commissionSettings.types')}</h2>
          <CommissionTypesEditor />
        </section>
        <div id={sectionId('addons')} className="scroll-mt-20">
          <CommissionAddonPricingSection />
        </div>
        <div id={sectionId('rushFee')} className="scroll-mt-20">
          <CommissionRushFeeSection artistId={artistId} />
        </div>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <CommissionPricingPreview artistId={artistId} />
      </aside>
    </div>
  );
}
