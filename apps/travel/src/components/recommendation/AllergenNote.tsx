import { useTranslation } from '@hatohui/i18n';
import type { TravelAllergenTag } from '@hatohui/models';
import { TriangleAlert } from 'lucide-react';

function AllergenNote({ allergens }: { allergens: TravelAllergenTag[] }) {
  const { t } = useTranslation();
  if (!allergens.length) return null;
  const list = allergens.map((tag) => t(`allergen.${tag}`)).join(', ');

  return (
    <p className="inline-flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-300">
      <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
      {t('recommendation.contains', { list })}
    </p>
  );
}

export default AllergenNote;
