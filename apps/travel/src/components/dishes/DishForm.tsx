import { useTranslation } from '@hatohui/i18n';
import type { TravelDishDto } from '@hatohui/models';
import { useDishForm } from '../../hooks/useDishForm';
import CuisineField from '../shared/CuisineField';
import DialogForm from '../shared/DialogForm';
import TextField from '../shared/TextField';
import DishPhotoField from './DishPhotoField';

interface Props {
  dish: TravelDishDto;
  onClose: () => void;
}

function DishForm({ dish, onClose }: Props) {
  const { t } = useTranslation();
  const form = useDishForm(dish, onClose);

  return (
    <DialogForm
      title={t('dishes.editTitle')}
      onSubmit={(event) => void form.submit(event)}
      canSubmit={form.values.name.trim() !== ''}
      isSaving={form.isSaving}
      onCancel={onClose}
    >
      <div className="space-y-5">
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
        <DishPhotoField
          initialKey={dish.imageKey}
          initialUrl={dish.imageUrl}
          onChange={(key) => form.set('imageKey', key)}
        />
      </div>
    </DialogForm>
  );
}

export default DishForm;
