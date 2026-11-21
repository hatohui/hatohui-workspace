import { useTranslation } from '@hatohui/i18n';
import { TriangleAlert } from 'lucide-react';
import { useTagOptions } from '../../hooks/useTagOptions';

function AllergenNote({ allergens }: { allergens: string[] }) {
  const { t } = useTranslation();
  const { labelOf } = useTagOptions();
  if (!allergens.length) return null;
  const list = allergens.map(labelOf).join(', ');

  return (
    <p className="inline-flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-300">
      <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
      {t('recommendation.contains', { list })}
    </p>
  );
}

export default AllergenNote;
