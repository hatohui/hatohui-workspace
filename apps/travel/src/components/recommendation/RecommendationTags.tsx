import type { TravelRecommendationDto } from '@hatohui/models';
import { Sparkles, Tag } from 'lucide-react';
import {
  DEFAULT_SPECIAL_BADGE_STYLE,
  SPECIAL_BADGE_STYLES,
  SPECIAL_ICONS,
} from '../../constants/travel';
import { useTagOptions } from '../../hooks/useTagOptions';

type Tags = Pick<TravelRecommendationDto, 'specials' | 'tags'>;

const chipClass =
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs';

function RecommendationTags({ tags }: { tags: Tags }) {
  const { labelOf } = useTagOptions();
  if (!tags.specials.length && !tags.tags.length) return null;

  return (
    <ul className="flex flex-wrap gap-1">
      {tags.specials.map((key) => {
        const Icon = SPECIAL_ICONS[key] ?? Sparkles;
        const style = SPECIAL_BADGE_STYLES[key] ?? DEFAULT_SPECIAL_BADGE_STYLE;
        return (
          <li key={key} className={`${chipClass} ${style}`}>
            <Icon className="size-3.5" aria-hidden />
            {labelOf(key)}
          </li>
        );
      })}
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
