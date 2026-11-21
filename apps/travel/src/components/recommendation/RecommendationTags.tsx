import { useTranslation } from '@hatohui/i18n';
import type { TravelRecommendationDto } from '@hatohui/models';
import SpiceFlames from './SpiceFlames';

type Tags = Pick<TravelRecommendationDto, 'spiceLevel' | 'diets'>;

function RecommendationTags({ tags }: { tags: Tags }) {
  const { t } = useTranslation();
  const isSpicy = tags.spiceLevel !== 'NONE';
  if (!isSpicy && !tags.diets.length) return null;

  return (
    <ul className="flex flex-wrap gap-1">
      {isSpicy && (
        <li className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-700 dark:text-red-300">
          <SpiceFlames level={tags.spiceLevel} />
          {t(`spice.${tags.spiceLevel}`)}
        </li>
      )}
      {tags.diets.map((diet) => (
        <li
          key={diet}
          className="rounded-full bg-green-600/10 px-2 py-0.5 text-xs text-green-800 dark:text-green-300"
        >
          {t(`diet.${diet}`)}
        </li>
      ))}
    </ul>
  );
}

export default RecommendationTags;
