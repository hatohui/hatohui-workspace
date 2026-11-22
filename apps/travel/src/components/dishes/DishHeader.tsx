import { useTranslation } from '@hatohui/i18n';
import type { TravelDishDetailDto } from '@hatohui/models';
import { Globe } from 'lucide-react';
import type { useConfirmedDelete } from '../../hooks/useConfirmedDelete';
import { useDialogState } from '../../hooks/useDialogState';
import CuisineChips from '../shared/CuisineChips';
import CreatorBadge from '../shared/CreatorBadge';
import EntityActions from '../shared/EntityActions';
import DishDialog from './DishDialog';

interface Props {
  dish: TravelDishDetailDto;
  deletion: ReturnType<typeof useConfirmedDelete>;
}

function DishHeader({ dish, deletion }: Props) {
  const { t } = useTranslation();
  const editor = useDialogState();
  const photoSrc = dish.previewUrl ?? dish.thumbnailUrl ?? dish.imageUrl;

  return (
    <header className="space-y-4 border-b border-border/60 pb-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {photoSrc && (
          <img
            src={photoSrc}
            alt={dish.name}
            className="aspect-[4/3] w-44 shrink-0 rounded-xl border border-border/60 bg-card object-cover"
          />
        )}
        <div className="min-w-0 flex-1 space-y-3">
          <h1 className="text-3xl font-medium tracking-tight">{dish.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            {dish.country && (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Globe className="size-3.5" aria-hidden />
                {dish.country.name}
              </span>
            )}
            <CuisineChips cuisines={dish.cuisines} />
          </div>
          {dish.description && (
            <p className="max-w-prose leading-relaxed text-muted-foreground">
              {dish.description}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CreatorBadge creator={dish.createdBy} />
            <EntityActions
              onEdit={editor.show}
              deletion={deletion}
              deleteTitle={t('dishes.deleteTitle')}
              deleteDescription={t('dishes.deleteDescription', {
                name: dish.name,
              })}
            />
          </div>
        </div>
      </div>
      <DishDialog key={editor.version} state={editor} dish={dish} />
    </header>
  );
}

export default DishHeader;
