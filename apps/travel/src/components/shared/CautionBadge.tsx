import { useTranslation } from '@hatohui/i18n';
import { TriangleAlert } from 'lucide-react';
import { useTagOptions } from '../../hooks/useTagOptions';

function CautionBadge({ allergens }: { allergens: string[] }) {
  const { t } = useTranslation();
  const { labelOf } = useTagOptions();
  if (!allergens.length) return null;
  const list = allergens.map(labelOf).join(', ');

  return (
    <span className="absolute top-1.5 left-1.5 inline-flex max-w-[calc(100%-0.75rem)] items-center gap-0.5 rounded-full bg-amber-500 px-1.5 py-px text-[10px] font-medium text-amber-950">
      <TriangleAlert className="size-3 shrink-0" aria-hidden />
      <span className="truncate">{t('recommendation.contains', { list })}</span>
    </span>
  );
}

export default CautionBadge;
