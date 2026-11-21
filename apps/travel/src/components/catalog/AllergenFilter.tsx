import { useTranslation } from '@hatohui/i18n';
import type { TravelAllergenTag } from '@hatohui/models';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
} from '@hatohui/ui';
import { TriangleAlert } from 'lucide-react';
import { ALLERGEN_TAGS } from '../../constants/travel';
import TagChipGroup from '../shared/TagChipGroup';

interface Props {
  selected: TravelAllergenTag[];
  onToggle: (tag: TravelAllergenTag) => void;
}

function AllergenFilter({ selected, onToggle }: Props) {
  const { t } = useTranslation();
  const count = selected.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-11 shrink-0 rounded-full sm:h-10',
            count > 0 && 'border-amber-500/60 bg-amber-500/10',
          )}
        >
          <TriangleAlert />
          <span className="hidden sm:inline">
            {count
              ? t('catalog.avoiding', { count })
              : t('catalog.avoidAllergens')}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('catalog.avoidHint')}
        </p>
        <TagChipGroup
          label={t('catalog.avoidAllergens')}
          tone="warning"
          options={ALLERGEN_TAGS}
          selected={selected}
          labelOf={(tag) => t(`allergen.${tag}`)}
          onToggle={onToggle}
        />
      </PopoverContent>
    </Popover>
  );
}

export default AllergenFilter;
