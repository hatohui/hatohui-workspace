import { useTranslation } from '@hatohui/i18n';
import type { TravelDishDetailDto } from '@hatohui/models';
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

  return (
    <header className="space-y-3 border-b border-border/60 pb-6">
      <h1 className="text-3xl font-medium tracking-tight">{dish.name}</h1>
      <CuisineChips cuisines={dish.cuisines} />
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
          deleteDescription={t('dishes.deleteDescription', { name: dish.name })}
        />
      </div>
      <DishDialog key={editor.version} state={editor} dish={dish} />
    </header>
  );
}

export default DishHeader;
