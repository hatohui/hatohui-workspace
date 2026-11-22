import { useTranslation } from '@hatohui/i18n';
import { TriangleAlert } from 'lucide-react';
import { useTagOptions } from '../../hooks/useTagOptions';

function CautionBadge({ allergens }: { allergens: string[] }) {
  const { t } = useTranslation();
  const { labelOf } = useTagOptions();
  if (!allergens.length) return null;
  const list = allergens.map(labelOf).join(', ');

  return (
    <span className="absolute top-2 left-2 inline-flex max-w-[calc(100%-1rem)] items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-amber-950 shadow-sm">
      <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">{t('recommendation.contains', { list })}</span>
    </span>
  );
}

export default CautionBadge;
