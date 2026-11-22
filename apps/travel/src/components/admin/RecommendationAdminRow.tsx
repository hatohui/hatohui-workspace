import { useTranslation } from '@hatohui/i18n';
import type { TravelRecommendationDto } from '@hatohui/models';
import { Button } from '@hatohui/ui';
import { Pencil, Trash2 } from 'lucide-react';
import PriceLabel from '../recommendation/PriceLabel';
import ImageFrame from '../shared/ImageFrame';

interface Props {
  recommendation: TravelRecommendationDto;
  onEdit: () => void;
  onDelete: () => void;
}

function RecommendationAdminRow({
  recommendation: rec,
  onEdit,
  onDelete,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className="w-14 shrink-0">
        <ImageFrame
          src={rec.images[0]?.url ?? rec.dish.imageUrl ?? null}
          alt={rec.dish.name}
          square
        />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="truncate font-medium">{rec.dish.name}</span>
          <span className="truncate text-sm text-muted-foreground">
            {rec.place.name}
            {rec.place.area ? ` · ${rec.place.area.name}` : ''}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <PriceLabel price={rec} />
          {rec.note && <span className="line-clamp-1">{rec.note}</span>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t('recommendation.edit')}
          onClick={onEdit}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t('recommendation.delete')}
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export default RecommendationAdminRow;
