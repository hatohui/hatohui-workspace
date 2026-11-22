import { Sparkles } from 'lucide-react';
import { SPECIAL_ICONS } from '../../constants/travel';
import { useTagOptions } from '../../hooks/useTagOptions';

interface Props {
  specials: string[];
  tags: string[];
  limit?: number;
}

function SpotTagBadges({ specials, tags, limit }: Props) {
  const tagOptions = useTagOptions();
  if (specials.length === 0 && tags.length === 0) return null;

  const visibleTags = limit !== undefined ? tags.slice(0, limit) : tags;
  const hiddenCount = tags.length - visibleTags.length;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {specials.map((key) => {
        const Icon = SPECIAL_ICONS[key] ?? Sparkles;
        return (
          <span
            key={`special-${key}`}
            className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-medium text-primary"
          >
            <Icon className="size-3 shrink-0" aria-hidden />
            {tagOptions.labelOf(key)}
          </span>
        );
      })}
      {visibleTags.map((key) => (
        <span
          key={`tag-${key}`}
          className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
        >
          {tagOptions.labelOf(key)}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="text-[11px] text-muted-foreground tabular-nums">
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}

export default SpotTagBadges;
