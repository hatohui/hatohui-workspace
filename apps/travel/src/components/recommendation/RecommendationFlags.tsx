import { useTranslation } from '@hatohui/i18n';
import { Flame, Leaf } from 'lucide-react';

interface Props {
  spicy: boolean;
  vegetarian: boolean;
}

function RecommendationFlags({ spicy, vegetarian }: Props) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      {spicy && (
        <Flame
          className="size-4 text-red-600 dark:text-red-400"
          aria-label={t('catalog.spicy')}
        />
      )}
      {vegetarian && (
        <Leaf
          className="size-4 text-green-700 dark:text-green-400"
          aria-label={t('catalog.vegetarian')}
        />
      )}
    </span>
  );
}

export default RecommendationFlags;
