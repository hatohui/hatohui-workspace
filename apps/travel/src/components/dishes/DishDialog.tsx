import { useTranslation } from '@hatohui/i18n';
import type { TravelDishDto } from '@hatohui/models';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@hatohui/ui';
import type { useDialogState } from '../../hooks/useDialogState';
import { useDishForm } from '../../hooks/useDishForm';
import CuisineField from '../shared/CuisineField';
import FormActions from '../shared/FormActions';
import TextField from '../shared/TextField';

interface Props {
  state: ReturnType<typeof useDialogState>;
  dish: TravelDishDto;
}

function DishDialog({ state, dish }: Props) {
  const { t } = useTranslation();
  const form = useDishForm(dish, state.close);

  return (
    <Dialog open={state.open} onOpenChange={state.setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dishes.editTitle')}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(event) => void form.submit(event)}
          className="space-y-5"
        >
          <TextField
            id="dish-name"
            required
            label={t('dishes.name')}
            value={form.values.name}
            onChange={(value) => form.set('name', value)}
          />
          <CuisineField
            id="dish-cuisines"
            value={form.values.cuisines}
            onChange={(value) => form.set('cuisines', value)}
          />
          <TextField
            id="dish-description"
            multiline
            label={t('dishes.description')}
            value={form.values.description}
            onChange={(value) => form.set('description', value)}
          />
          <FormActions
            canSubmit={form.values.name.trim() !== ''}
            isSaving={form.isSaving}
            onCancel={state.close}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DishDialog;
