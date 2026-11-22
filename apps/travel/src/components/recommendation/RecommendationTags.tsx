import { useTranslation } from '@hatohui/i18n';
import type { TravelRecommendationDto } from '@hatohui/models';
import { Flame, Tag } from 'lucide-react';
import { DIET_ICONS } from '../../constants/travel';
import { useTagOptions } from '../../hooks/useTagOptions';
import TagChipIcon from '../shared/TagChipIcon';

type Tags = Pick<TravelRecommendationDto, 'spicy' | 'diets' | 'tags'>;

const chipClass =
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs';

function RecommendationTags({ tags }: { tags: Tags }) {
  const { t } = useTranslation();
  const { labelOf } = useTagOptions();
  if (!tags.spicy && !tags.diets.length && !tags.tags.length) return null;

  return (
    <ul className="flex flex-wrap gap-1">
      {tags.spicy && (
        <li
          className={`${chipClass} bg-red-500/10 text-red-700 dark:text-red-300`}
        >
          <Flame className="size-3.5" aria-hidden />
          {t('catalog.spicy')}
        </li>
      )}
      {tags.diets.map((diet) => (
        <li
          key={diet}
          className={`${chipClass} bg-green-600/10 text-green-800 dark:text-green-300`}
        >
          <TagChipIcon icon={DIET_ICONS[diet]} />
          {labelOf(diet)}
        </li>
      ))}
      {tags.tags.map((tag) => (
        <li
          key={tag}
          className={`${chipClass} bg-secondary text-secondary-foreground`}
        >
          <Tag className="size-3" aria-hidden />
          {labelOf(tag)}
        </li>
      ))}
    </ul>
  );
}

export default RecommendationTags;
